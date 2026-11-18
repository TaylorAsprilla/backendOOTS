import { createHash, randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import { CaseStatus, CaseType, Role } from '../common/enums';
import { assertCountryAccess } from '../common/utils/country-access';
import { CaseAttachment, CaseAttachmentEvent } from './case-attachment.entity';
import {
  AttachmentAction,
  AttachmentCategory,
  AttachmentContext,
  AttachmentStatus,
  CATEGORIES_BY_CONTEXT,
} from './case-attachment.enums';
import { sanitizeFileName, validateUploadedFile } from './file-validation';
import { S3StorageService } from './s3-storage.service';

export interface UploadInput {
  caseId: number;
  context: AttachmentContext;
  category: AttachmentCategory;
  description?: string;
  signedAt?: string;
}

export interface UploadedFileInput {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const FOLDER_BY_CONTEXT: Record<AttachmentContext, string> = {
  [AttachmentContext.CONSENT]: 'consents',
  [AttachmentContext.FOLLOW_UP_REFERRAL]: 'follow-up-referrals',
  [AttachmentContext.REFERRAL]: 'referrals',
};

@Injectable()
export class CaseAttachmentsService {
  private readonly logger = new Logger(CaseAttachmentsService.name);

  constructor(
    @InjectRepository(CaseAttachment)
    private readonly attachments: Repository<CaseAttachment>,
    @InjectRepository(CaseAttachmentEvent)
    private readonly events: Repository<CaseAttachmentEvent>,
    @InjectRepository(Case)
    private readonly cases: Repository<Case>,
    private readonly storage: S3StorageService,
    private readonly config: ConfigService,
  ) {}

  get maxFileBytes(): number {
    const mb = Number(this.config.get('DOCUMENTS_MAX_FILE_MB') ?? 15);
    return (Number.isFinite(mb) && mb > 0 ? mb : 15) * 1024 * 1024;
  }

  /**
   * Mismas reglas de acceso que los casos: ADMIN todo; ADMIN_COUNTRY su país;
   * TRABAJO_SOCIAL/USER solo expedientes que crearon o tienen asignados.
   * Con `write`, el expediente cerrado es inmutable para todos los roles.
   */
  private async loadAccessibleCase(
    caseId: number,
    user: User,
    write: boolean,
  ): Promise<Case> {
    const caseEntity = await this.cases.findOne({
      where: { id: caseId },
      relations: ['participant'],
    });
    if (!caseEntity) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    const role = user.role?.name;
    if (role === Role.ADMIN_COUNTRY) {
      assertCountryAccess(user, caseEntity.participant?.countryId);
    } else if (role !== Role.ADMIN) {
      const mine =
        Number(caseEntity.createdById) === Number(user.id) ||
        Number(caseEntity.assignedToId) === Number(user.id);
      if (!mine) {
        throw new ForbiddenException(
          'No tiene acceso a los documentos de este expediente',
        );
      }
    }

    if (write && caseEntity.status === CaseStatus.CLOSED) {
      throw new ConflictException(
        'El expediente cerrado es inmutable: no se pueden agregar ni eliminar documentos',
      );
    }
    return caseEntity;
  }

  private async logEvent(
    attachment: CaseAttachment,
    userId: number,
    action: AttachmentAction,
  ): Promise<void> {
    await this.events.save(
      this.events.create({
        attachmentId: attachment.id,
        caseId: attachment.caseId,
        userId,
        action,
      }),
    );
  }

  private toView(a: CaseAttachment) {
    const u = a.uploadedBy;
    return {
      id: a.id,
      caseId: a.caseId,
      context: a.context,
      category: a.category,
      originalName: a.originalName,
      mimeType: a.mimeType,
      extension: a.extension,
      size: a.size,
      description: a.description ?? null,
      signedAt: a.signedAt ?? null,
      createdAt: a.createdAt,
      uploadedBy: u
        ? {
            id: u.id,
            name: [u.firstName, u.firstLastName].filter(Boolean).join(' '),
          }
        : null,
    };
  }

  async upload(
    input: UploadInput,
    file: UploadedFileInput | undefined,
    user: User,
  ) {
    if (!file) throw new BadRequestException('Debe adjuntar un archivo');
    if (!CATEGORIES_BY_CONTEXT[input.context]?.includes(input.category)) {
      throw new BadRequestException(
        'La categoría no es válida para esta sección',
      );
    }
    const description = input.description?.trim() || null;
    if (input.category === AttachmentCategory.OTHER && !description) {
      throw new BadRequestException(
        'Para la categoría "Otros" indique el nombre o descripción del documento',
      );
    }

    const caseEntity = await this.loadAccessibleCase(input.caseId, user, true);
    const detected = await validateUploadedFile(file, this.maxFileBytes);

    // Los documentos de consultas breves y de casos viven en prefijos distintos
    const root =
      caseEntity.caseType === CaseType.BRIEF_CONSULTATION
        ? 'brief-consultations'
        : 'cases';
    const storageKey = `${root}/${caseEntity.id}/${FOLDER_BY_CONTEXT[input.context]}/${randomUUID()}.${detected.extension}`;

    await this.storage.put(storageKey, file.buffer, detected.mimeType);

    try {
      const saved = await this.attachments.save(
        this.attachments.create({
          caseId: caseEntity.id,
          context: input.context,
          category: input.category,
          originalName: sanitizeFileName(file.originalname),
          storageKey,
          mimeType: detected.mimeType,
          extension: detected.extension,
          size: file.buffer.length,
          sha256: createHash('sha256').update(file.buffer).digest('hex'),
          description,
          signedAt: input.signedAt || null,
          status: AttachmentStatus.ACTIVE,
          uploadedById: user.id,
        }),
      );
      await this.logEvent(saved, user.id, AttachmentAction.UPLOAD);
      const full = await this.attachments.findOneOrFail({
        where: { id: saved.id },
      });
      return this.toView(full);
    } catch (error) {
      // Evita objetos huérfanos si el registro de metadatos falla
      await this.storage.remove(storageKey).catch(() => {
        this.logger.error(`Objeto huérfano en S3: ${storageKey}`);
      });
      throw error;
    }
  }

  async list(caseId: number, user: User, context?: AttachmentContext) {
    await this.loadAccessibleCase(caseId, user, false);
    const rows = await this.attachments.find({
      where: {
        caseId,
        status: AttachmentStatus.ACTIVE,
        ...(context ? { context } : {}),
      },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.toView(row));
  }

  private async findActive(id: number): Promise<CaseAttachment> {
    const attachment = await this.attachments.findOne({ where: { id } });
    if (!attachment || attachment.status !== AttachmentStatus.ACTIVE) {
      throw new NotFoundException('Documento no encontrado');
    }
    return attachment;
  }

  async getDownloadUrl(id: number, user: User) {
    const attachment = await this.findActive(id);
    await this.loadAccessibleCase(attachment.caseId, user, false);
    const url = await this.storage.presignedDownloadUrl(
      attachment.storageKey,
      attachment.originalName,
    );
    await this.logEvent(attachment, user.id, AttachmentAction.DOWNLOAD);
    return {
      url,
      fileName: attachment.originalName,
      expiresInSeconds: this.storage.downloadTtlSeconds,
    };
  }

  /** Baja lógica: se conserva el objeto en S3 y el registro para trazabilidad. */
  async remove(id: number, user: User) {
    const attachment = await this.findActive(id);
    await this.loadAccessibleCase(attachment.caseId, user, true);
    attachment.status = AttachmentStatus.DELETED;
    attachment.deletedAt = new Date();
    attachment.deletedById = user.id;
    await this.attachments.save(attachment);
    await this.logEvent(attachment, user.id, AttachmentAction.DELETE);
    return { id, deleted: true };
  }
}
