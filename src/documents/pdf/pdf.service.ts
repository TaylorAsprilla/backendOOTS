import { Injectable, Logger } from '@nestjs/common';
import { Case } from '../../participants/entities/case.entity';
import { ProgressNote } from '../../participants/entities/progress-note.entity';
import { User } from '../../users/entities/user.entity';
import { renderPdfToBuffer } from './pdf-shared';
import { buildHelpProcessCompletionDoc } from './templates/help-process-completion.template';
import { buildInterventionPlanDoc } from './templates/intervention-plan.template';
import { buildProgressNoteDoc } from './templates/progress-note.template';
import { buildClosingNoteDoc } from './templates/closing-note.template';
import { buildFullCaseDoc } from './templates/full-case.template';

/**
 * Servicio centralizado de generación de PDFs para documentos del caso.
 * Recibe entidades ya pobladas con sus relaciones; no consulta la base de datos.
 */
@Injectable()
export class DocumentGeneratorService {
  private readonly logger = new Logger(DocumentGeneratorService.name);

  async generateHelpProcessCompletion(
    caseEntity: Case,
    currentUser: User,
  ): Promise<Buffer> {
    try {
      const doc = buildHelpProcessCompletionDoc(caseEntity, currentUser);
      return await renderPdfToBuffer(doc);
    } catch (err) {
      this.logger.error(
        `Error generando PDF de culminación (caso ${caseEntity.id})`,
        err as Error,
      );
      throw err;
    }
  }

  async generateInterventionPlan(
    caseEntity: Case,
    currentUser: User,
  ): Promise<Buffer> {
    try {
      const doc = buildInterventionPlanDoc(caseEntity, currentUser);
      return await renderPdfToBuffer(doc);
    } catch (err) {
      this.logger.error(
        `Error generando PDF plan de intervención (caso ${caseEntity.id})`,
        err as Error,
      );
      throw err;
    }
  }

  async generateProgressNote(
    caseEntity: Case,
    note: ProgressNote,
    currentUser: User,
  ): Promise<Buffer> {
    try {
      const doc = buildProgressNoteDoc(caseEntity, note, currentUser);
      return await renderPdfToBuffer(doc);
    } catch (err) {
      this.logger.error(
        `Error generando PDF nota de progreso (caso ${caseEntity.id}, nota ${note.id})`,
        err as Error,
      );
      throw err;
    }
  }

  async generateClosingNote(
    caseEntity: Case,
    currentUser: User,
  ): Promise<Buffer> {
    try {
      const doc = buildClosingNoteDoc(caseEntity, currentUser);
      return await renderPdfToBuffer(doc);
    } catch (err) {
      this.logger.error(
        `Error generando PDF nota de cierre (caso ${caseEntity.id})`,
        err as Error,
      );
      throw err;
    }
  }

  async generateFullCase(caseEntity: Case, currentUser: User): Promise<Buffer> {
    try {
      const doc = buildFullCaseDoc(caseEntity, currentUser);
      return await renderPdfToBuffer(doc);
    } catch (err) {
      this.logger.error(
        `Error generando PDF completo del caso (caso ${caseEntity.id})`,
        err as Error,
      );
      throw err;
    }
  }
}
