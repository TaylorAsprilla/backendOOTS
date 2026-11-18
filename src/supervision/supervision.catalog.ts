/**
 * Catálogo de las listas de revisión de supervisión (Docs supervisión OOTS.xlsx):
 * "Orden de Expediente" (expediente del participante) y
 * "Orden Expediente – Supervisión" (expediente del supervisado).
 */
export enum ReviewType {
  /** Control de calidad del expediente de un participante (caso). */
  CASE_FILE = 'CASE_FILE',
  /** Control de calidad del expediente del supervisado (profesional). */
  SUPERVISEE_FILE = 'SUPERVISEE_FILE',
}

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
}

/** Leyenda del formato: ✓ X IN ? R N/A */
export enum ItemStatus {
  COMPLETE = 'COMPLETE',
  MISPLACED = 'MISPLACED',
  INCOMPLETE = 'INCOMPLETE',
  MISSING = 'MISSING',
  WRITING_ERRORS = 'WRITING_ERRORS',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export const ITEM_STATUS_LABEL: Record<
  ItemStatus,
  { symbol: string; label: string }
> = {
  [ItemStatus.COMPLETE]: { symbol: '✓', label: 'Completo' },
  [ItemStatus.MISPLACED]: { symbol: 'X', label: 'Fuera de lugar' },
  [ItemStatus.INCOMPLETE]: { symbol: 'IN', label: 'Incompleto' },
  [ItemStatus.MISSING]: { symbol: '?', label: 'No está el documento' },
  [ItemStatus.WRITING_ERRORS]: { symbol: 'R', label: 'Errores de redacción' },
  [ItemStatus.NOT_APPLICABLE]: { symbol: 'N/A', label: 'No aplica' },
};

export interface CatalogItem {
  key: string;
  label: string;
  group: string;
}

const g = (group: string, items: Array<[string, string]>): CatalogItem[] =>
  items.map(([key, label]) => ({ key, label, group }));

export const CATALOG: Record<ReviewType, CatalogItem[]> = {
  [ReviewType.CASE_FILE]: [
    ...g('Lado izquierdo', [
      ['attendance_record', 'Registro de Asistencia'],
      ['medical_evaluations', 'Evaluaciones médicas'],
      ['psychiatric_evaluations', 'Evaluaciones psiquiátricas'],
      ['psychological_evaluations', 'Evaluaciones psicológicas'],
      ['referrals', 'Referidos'],
    ]),
    ...g('Lado derecho', [
      ['initial_interview', 'Entrevista Inicial'],
      ['release_of_liability', 'Relevo de Responsabilidad'],
      ['confidentiality', 'Parámetros de Confidencialidad'],
      ['intervention_contract', 'Contrato de Intervención'],
      ['consent_disclose_info', 'Consentimiento Divulgar la Info'],
      ['service_plan', 'Plan de servicios'],
      ['social_history', 'Historial Social'],
      ['progress_notes', 'Notas de Progreso'],
      ['transfer_report', 'Informe de Transferencia'],
      ['closing_report', 'Informe de Cierre'],
      ['case_discussion', 'Discusión de caso'],
      ['purchase_certificate', 'Certificado de compra'],
      ['interview_certificate', 'Certificado de entrevista'],
    ]),
  ],
  [ReviewType.SUPERVISEE_FILE]: [
    ...g('Lado izquierdo 1', [
      ['attendance_record', 'Registro de Asistencia'],
      ['phone_messages', 'Mensajes Telefónicos'],
      ['phone_contact_sheet', 'Hoja de Contacto Telefónico'],
    ]),
    ...g('Lado izquierdo 2', [
      ['supervision_contract', 'Contrato de Supervisión'],
      ['curriculum_vitae', 'Curriculum Vitae/Resumé'],
      ['release_of_liability', 'Relevo de Responsabilidad'],
      ['confidentiality', 'Parámetros de Confidencialidad'],
      ['supervision_calendar', 'Calendario de Supervisión'],
    ]),
    ...g('Lado derecho 1', [
      ['tardiness_report', 'Informe de Tardanza'],
      ['absence_report', 'Informe de Ausencia'],
      ['previous_evaluations', 'Evaluaciones Previas'],
      ['reports_letters', 'Informes/Cartas'],
    ]),
    ...g('Lado derecho 2', [
      ['supervision_sheet', 'Hoja de Supervisión'],
      ['attendance_cert_adsm', 'Certificado de Asistencia: ADSM'],
      ['attendance_cert_dc', 'Certificado de Asistencia: DC'],
      ['evaluations', 'Evaluaciones'],
      ['file_order_sheet', 'Hoja de Orden de Expediente'],
    ]),
    ...g('Otros', [['written_reprimand', 'Amonestación Escrita']]),
  ],
};

export const itemKeys = (type: ReviewType): string[] =>
  CATALOG[type].map((item) => item.key);
