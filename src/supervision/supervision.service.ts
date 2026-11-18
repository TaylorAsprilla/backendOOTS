import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { CaseDiscussion } from '../case-discussions/entities/case-discussion.entity';
import {
  CaseTransfer,
  TransferStatus,
} from '../cases/entities/case-transfer.entity';
import { CaseAttachment } from '../case-attachments/case-attachment.entity';
import {
  AttachmentCategory,
  AttachmentContext,
  AttachmentStatus,
} from '../case-attachments/case-attachment.enums';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../common/enums/user-status.enum';
import { CASE_ASSIGNABLE_ROLES, Role } from '../common/enums/role.enum';
import {
  assertCountryAccess,
  getAdminCountryId,
} from '../common/utils/country-access';
import { SupervisionReview } from './supervision-review.entity';
import {
  CATALOG,
  ItemStatus,
  ReviewStatus,
  ReviewType,
  itemKeys,
} from './supervision.catalog';

export interface CreateReviewInput {
  type: ReviewType;
  caseId?: number;
  superviseeId?: number;
  period?: string;
  casesCount?: number;
  items?: Record<string, string>;
  recommendations?: string;
}

export interface UpdateReviewInput {
  period?: string;
  casesCount?: number;
  items?: Record<string, string>;
  recommendations?: string;
}

@Injectable()
export class SupervisionService {
  constructor(
    @InjectRepository(SupervisionReview)
    private readonly reviews: Repository<SupervisionReview>,
    @InjectRepository(Case) private readonly cases: Repository<Case>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(ProgressNote)
    private readonly progressNotes: Repository<ProgressNote>,
    @InjectRepository(ClosingNote)
    private readonly closingNotes: Repository<ClosingNote>,
    @InjectRepository(FollowUpPlan)
    private readonly followUpPlans: Repository<FollowUpPlan>,
    @InjectRepository(InterventionPlan)
    private readonly interventionPlans: Repository<InterventionPlan>,
    @InjectRepository(CaseDiscussion)
    private readonly discussions: Repository<CaseDiscussion>,
    @InjectRepository(CaseTransfer)
    private readonly transfers: Repository<CaseTransfer>,
    @InjectRepository(CaseAttachment)
    private readonly attachments: Repository<CaseAttachment>,
  ) {}

  /** Búsqueda de casos por número de expediente, nombre o documento del participante. */
  async searchCases(
    user: User,
    term: string,
  ): Promise<
    Array<{
      id: number;
      caseNumber?: string;
      status?: string;
      participantName: string;
    }>
  > {
    const text = term.trim();
    if (text.length < 2) return [];
    const like = `%${text.replace(/[%_]/g, '')}%`;
    const query = this.cases
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.participant', 'p')
      .where(
        `(c.caseNumber LIKE :like OR p.firstName LIKE :like OR p.firstLastName LIKE :like
          OR p.documentNumber LIKE :like
          OR CONCAT_WS(' ', p.firstName, p.firstLastName) LIKE :like)`,
        { like },
      )
      .orderBy('c.createdAt', 'DESC')
      .take(20);
    const countryId = getAdminCountryId(user);
    if (countryId !== undefined) {
      query.andWhere('p.countryId = :countryId', { countryId });
    }
    const rows = await query.getMany();
    return rows.map((row) => ({
      id: row.id,
      caseNumber: row.caseNumber,
      status: row.status,
      participantName: [
        row.participant?.firstName,
        row.participant?.firstLastName,
      ]
        .filter(Boolean)
        .join(' '),
    }));
  }

  /** Profesionales que pueden ser supervisados (de su país si es ADMIN_COUNTRY). */
  async listSupervisees(user: User): Promise<User[]> {
    const countryId = getAdminCountryId(user);
    const rows = await this.users.find({
      where: countryId === undefined ? {} : { countryId },
    });
    return rows.filter(
      (row) =>
        row.status === UserStatus.ACTIVE &&
        CASE_ASSIGNABLE_ROLES.includes(row.role?.name as Role) &&
        row.id !== user.id,
    );
  }

  async create(
    input: CreateReviewInput,
    user: User,
  ): Promise<SupervisionReview> {
    let caseId: number | null = null;
    let superviseeId: number | null = null;

    if (input.type === ReviewType.CASE_FILE) {
      if (!input.caseId) {
        throw new BadRequestException('Indique el caso (expediente) a revisar');
      }
      const caseEntity = await this.cases.findOne({
        where: { id: input.caseId },
        relations: ['participant'],
      });
      if (!caseEntity) {
        throw new NotFoundException(`Caso ${input.caseId} no encontrado`);
      }
      assertCountryAccess(user, caseEntity.participant?.countryId);
      caseId = caseEntity.id;
    } else {
      if (!input.superviseeId) {
        throw new BadRequestException('Indique el supervisado');
      }
      const supervisee = await this.users.findOne({
        where: { id: input.superviseeId },
      });
      if (!supervisee) {
        throw new NotFoundException(
          `Usuario ${input.superviseeId} no encontrado`,
        );
      }
      if (!CASE_ASSIGNABLE_ROLES.includes(supervisee.role?.name as Role)) {
        throw new BadRequestException(
          'El usuario no tiene un rol que pueda ser supervisado',
        );
      }
      if (supervisee.id === user.id) {
        throw new BadRequestException('No puede revisar su propio expediente');
      }
      assertCountryAccess(user, supervisee.countryId);
      superviseeId = supervisee.id;
    }

    const review = this.reviews.create({
      type: input.type,
      caseId,
      superviseeId,
      reviewerId: user.id,
      period: this.normalizePeriod(input.period),
      casesCount: input.casesCount ?? null,
      items: this.validateItems(input.type, input.items ?? {}),
      recommendations: input.recommendations?.trim() || null,
      status: ReviewStatus.DRAFT,
    });
    const saved = await this.reviews.save(review);
    return await this.findOne(saved.id, user);
  }

  async list(
    user: User,
    filters: { type?: ReviewType; caseId?: number; superviseeId?: number },
  ): Promise<SupervisionReview[]> {
    const query = this.reviews
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.supervisee', 'supervisee')
      .leftJoinAndSelect('review.case', 'case')
      .leftJoinAndSelect('case.participant', 'participant')
      .orderBy('review.createdAt', 'DESC');

    if (filters.type)
      query.andWhere('review.type = :type', { type: filters.type });
    if (filters.caseId)
      query.andWhere('review.caseId = :caseId', { caseId: filters.caseId });
    if (filters.superviseeId) {
      query.andWhere('review.superviseeId = :superviseeId', {
        superviseeId: filters.superviseeId,
      });
    }

    const countryId = getAdminCountryId(user);
    if (countryId !== undefined) {
      query.andWhere(
        '(participant.countryId = :countryId OR supervisee.countryId = :countryId)',
        { countryId },
      );
    } else if (user.role?.name !== Role.ADMIN) {
      // SUPERVISOR: solo las revisiones que elaboró
      query.andWhere('review.reviewerId = :userId', { userId: user.id });
    }
    return await query.getMany();
  }

  async findOne(id: number, user: User): Promise<SupervisionReview> {
    const review = await this.reviews.findOne({
      where: { id },
      relations: ['case', 'case.participant'],
    });
    if (!review) throw new NotFoundException(`Revisión ${id} no encontrada`);
    this.assertCanRead(review, user);
    return review;
  }

  async update(
    id: number,
    input: UpdateReviewInput,
    user: User,
  ): Promise<SupervisionReview> {
    const review = await this.findOne(id, user);
    this.assertCanWrite(review, user);
    if (input.items) {
      review.items = {
        ...review.items,
        ...this.validateItems(review.type, input.items),
      };
    }
    if (input.period !== undefined) {
      review.period = this.normalizePeriod(input.period);
    }
    if (input.casesCount !== undefined) review.casesCount = input.casesCount;
    if (input.recommendations !== undefined) {
      review.recommendations = input.recommendations.trim() || null;
    }
    await this.reviews.save(review);
    return await this.findOne(id, user);
  }

  /** Firma la revisión (queda inmutable): todos los ítems deben tener estado. */
  async sign(id: number, user: User): Promise<SupervisionReview> {
    const review = await this.findOne(id, user);
    this.assertCanWrite(review, user);
    const missing = itemKeys(review.type).filter((key) => !review.items[key]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Faltan ${missing.length} ítems por calificar antes de firmar`,
      );
    }
    review.status = ReviewStatus.SIGNED;
    review.signedAt = new Date();
    await this.reviews.save(review);
    return await this.findOne(id, user);
  }

  /**
   * Sugerencias automáticas para el expediente de un participante: ítems que el
   * sistema ya encuentra registrados. El supervisor confirma o corrige.
   */
  async suggestions(
    caseId: number,
    user: User,
  ): Promise<Record<string, ItemStatus>> {
    const caseEntity = await this.cases.findOne({
      where: { id: caseId },
      relations: ['participant'],
    });
    if (!caseEntity)
      throw new NotFoundException(`Caso ${caseId} no encontrado`);
    assertCountryAccess(user, caseEntity.participant?.countryId);

    const hasAttachment = async (
      category?: AttachmentCategory,
      context?: AttachmentContext,
    ) =>
      (await this.attachments.count({
        where: {
          caseId,
          status: AttachmentStatus.ACTIVE,
          ...(category ? { category } : {}),
          ...(context ? { context } : {}),
        },
      })) > 0;

    const found: Record<string, boolean> = {
      progress_notes:
        (await this.progressNotes.count({ where: { caseId } })) > 0,
      closing_report:
        (await this.closingNotes.count({ where: { caseId } })) > 0,
      service_plan:
        (await this.followUpPlans.count({ where: { caseId } })) > 0 ||
        (await this.interventionPlans.count({ where: { caseId } })) > 0,
      case_discussion:
        (await this.discussions.count({ where: { caseId } })) > 0,
      transfer_report:
        (await this.transfers.count({
          where: { caseId, status: TransferStatus.APPROVED },
        })) > 0,
      release_of_liability: await hasAttachment(
        AttachmentCategory.RELEASE_OF_LIABILITY,
      ),
      confidentiality: await hasAttachment(AttachmentCategory.CONFIDENTIALITY),
      referrals: await hasAttachment(undefined, AttachmentContext.REFERRAL),
    };
    const result: Record<string, ItemStatus> = {};
    for (const [key, exists] of Object.entries(found)) {
      if (exists) result[key] = ItemStatus.COMPLETE;
    }
    return result;
  }

  private validateItems(
    type: ReviewType,
    items: Record<string, string>,
  ): Record<string, string> {
    const allowedKeys = new Set(itemKeys(type));
    const allowedValues = new Set<string>(Object.values(ItemStatus));
    for (const [key, value] of Object.entries(items)) {
      if (!allowedKeys.has(key)) {
        throw new BadRequestException(
          `El ítem "${key}" no pertenece a esta revisión`,
        );
      }
      if (!allowedValues.has(value)) {
        throw new BadRequestException(`Estado inválido para "${key}"`);
      }
    }
    return { ...items };
  }

  private normalizePeriod(period?: string): string | null {
    if (!period) return null;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      throw new BadRequestException('El periodo debe tener formato AAAA-MM');
    }
    return period;
  }

  private assertCanRead(review: SupervisionReview, user: User): void {
    const role = user.role?.name;
    if (role === Role.ADMIN) return;
    if (role === Role.ADMIN_COUNTRY) {
      const countryId =
        review.type === ReviewType.CASE_FILE
          ? review.case?.participant?.countryId
          : review.supervisee?.countryId;
      assertCountryAccess(user, countryId);
      return;
    }
    if (review.reviewerId !== user.id) {
      throw new ForbiddenException('No tiene acceso a esta revisión');
    }
  }

  /** Solo quien la elaboró (o ADMIN) edita o firma, y solo mientras es borrador. */
  private assertCanWrite(review: SupervisionReview, user: User): void {
    if (review.status === ReviewStatus.SIGNED) {
      throw new ConflictException(
        'La revisión ya fue firmada y no se puede modificar',
      );
    }
    if (user.role?.name !== Role.ADMIN && review.reviewerId !== user.id) {
      throw new ForbiddenException(
        'Solo quien elaboró la revisión puede modificarla o firmarla',
      );
    }
  }

  catalog(type: ReviewType) {
    return CATALOG[type];
  }
}
