/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Case } from '../../../participants/entities/case.entity';
import { ProgressNote } from '../../../participants/entities/progress-note.entity';
import { User } from '../../../users/entities/user.entity';
import {
  baseDocDefinition,
  buildCoverBanner,
  buildSignatureBlock,
  caseInfoSection,
  dataTable,
  formatDate,
  fullUserName,
  participantInfoSection,
  sectionTitle,
  TDocumentDefinitions,
} from '../pdf-shared';

export function buildProgressNoteDoc(
  caseEntity: Case,
  note: ProgressNote,
  currentUser: User,
): TDocumentDefinitions {
  return baseDocDefinition([
    ...buildCoverBanner(
      'NOTA DE PROGRESO',
      caseEntity,
      `Sesión del ${formatDate(note.startDate)}`,
    ),
    ...participantInfoSection(caseEntity),
    ...caseInfoSection(caseEntity),

    sectionTitle('Datos de la Sesión'),
    dataTable([
      ['Fecha de inicio', formatDate(note.startDate)],
      ['Fecha de culminación', formatDate(note.endDate)],
      ['Hora de inicio', note.startTime],
      ['Hora de culminación', note.endTime],
      ['Asistió', note.attended ? 'Sí' : 'No'],
      [
        'Motivo de inasistencia',
        note.attended ? undefined : note.absenceReason,
      ],
      ['Tipo de abordaje', note.approachType?.name],
      ['Tipo de proceso', note.processType?.name],
      ['Profesional que registra', fullUserName(currentUser)],
    ]),

    sectionTitle('Contenido de la Nota'),
    dataTable([
      ['Proceso', note.process],
      ['Resumen / Evolución', note.summary],
      ['Observaciones', note.observations],
      ['Acuerdos / Compromisos', note.agreements],
    ]),

    buildSignatureBlock(currentUser),
  ]);
}
