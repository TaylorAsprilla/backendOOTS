import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CaseDocumentHistoryService,
  CaseDocumentKind,
} from '../cases/case-document-history.service';
import { Case } from '../participants/entities/case.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { User } from '../users/entities/user.entity';
import { DocumentGeneratorService } from './pdf/pdf.service';
import { CaseStatus } from '../common/enums';

/**
 * Orquesta la obtención de datos del caso y la generación del PDF correspondiente.
 * Centraliza la consulta del caso para evitar duplicación entre endpoints.
 */
@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentHistory: CaseDocumentHistoryService,
    private readonly pdfService: DocumentGeneratorService,
  ) {}

  /**
   * Recupera el caso con todas sus relaciones para alimentar los PDFs.
   * Lanza NotFoundException si el caso no existe.
   */
  private async getCaseOrFail(
    caseId: number,
    user: User,
    kind: CaseDocumentKind,
  ): Promise<Case> {
    return await this.documentHistory.getDocumentCase(caseId, user, kind);
  }

  async generateHelpProcessCompletion(
    caseId: number,
    currentUser: User,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const caseEntity = await this.getCaseOrFail(
      caseId,
      currentUser,
      'completion',
    );

    if (!caseEntity.followUpPlans || caseEntity.followUpPlans.length === 0) {
      throw new UnprocessableEntityException(
        caseEntity.status === CaseStatus.CLOSED
          ? 'No se puede descargar la culminación del proceso de ayuda: no se registró esta información antes de cerrar el expediente. Contacte al administrador.'
          : 'Aún no puede descargar la culminación del proceso de ayuda. Complete y guarde el plan de seguimiento del caso y vuelva a intentarlo.',
      );
    }

    const buffer = await this.pdfService.generateHelpProcessCompletion(
      caseEntity,
      caseEntity.createdBy ?? new User(),
    );
    return {
      buffer,
      filename: `culminacion-proceso-${caseEntity.caseNumber ?? caseEntity.id}.pdf`,
    };
  }

  async generateInterventionPlan(
    caseId: number,
    currentUser: User,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const caseEntity = await this.getCaseOrFail(
      caseId,
      currentUser,
      'intervention',
    );

    if (
      !caseEntity.interventionPlans ||
      caseEntity.interventionPlans.length === 0
    ) {
      throw new UnprocessableEntityException(
        caseEntity.status === CaseStatus.CLOSED
          ? 'No se puede descargar el plan de intervención: no se registró antes de cerrar el expediente. Contacte al administrador.'
          : 'Aún no puede descargar el plan de intervención. Registre y guarde un plan de intervención en el caso y vuelva a intentarlo.',
      );
    }

    const buffer = await this.pdfService.generateInterventionPlan(
      caseEntity,
      caseEntity.createdBy ?? new User(),
    );
    return {
      buffer,
      filename: `plan-intervencion-${caseEntity.caseNumber ?? caseEntity.id}.pdf`,
    };
  }

  async generateProgressNote(
    caseId: number,
    progressNoteId: number,
    currentUser: User,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const caseEntity = await this.getCaseOrFail(
      caseId,
      currentUser,
      'progress',
    );

    const note: ProgressNote | undefined = (
      caseEntity.progressNotes ?? []
    ).find((n) => n.id === progressNoteId);

    if (!note) {
      throw new NotFoundException(
        'No se encontró la nota de progreso solicitada en este caso. Actualice la página y seleccione una nota de progreso guardada.',
      );
    }

    const buffer = await this.pdfService.generateProgressNote(
      caseEntity,
      note,
      caseEntity.createdBy ?? new User(),
    );
    return {
      buffer,
      filename: `nota-progreso-${caseEntity.caseNumber ?? caseEntity.id}-${note.id}.pdf`,
    };
  }

  async generateClosingNote(
    caseId: number,
    currentUser: User,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const caseEntity = await this.getCaseOrFail(caseId, currentUser, 'closing');

    if (!caseEntity.closingNote) {
      throw new NotFoundException(
        caseEntity.status === CaseStatus.CLOSED
          ? 'No se puede descargar la nota de cierre: no se registró antes de cerrar el expediente. Contacte al administrador.'
          : 'Aún no puede descargar la nota de cierre. Registre y guarde la nota en la sección «Nota de cierre» del caso y vuelva a intentarlo.',
      );
    }

    const buffer = await this.pdfService.generateClosingNote(
      caseEntity,
      caseEntity.createdBy ?? new User(),
    );
    return {
      buffer,
      filename: `nota-cierre-${caseEntity.caseNumber ?? caseEntity.id}.pdf`,
    };
  }

  async generateFullCase(
    caseId: number,
    currentUser: User,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const caseEntity = await this.getCaseOrFail(caseId, currentUser, 'full');

    const buffer = await this.pdfService.generateFullCase(
      caseEntity,
      caseEntity.createdBy ?? new User(),
    );
    return {
      buffer,
      filename: `caso-completo-${caseEntity.caseNumber ?? caseEntity.id}.pdf`,
    };
  }
}
