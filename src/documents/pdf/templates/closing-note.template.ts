/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Case } from '../../../participants/entities/case.entity';
import { User } from '../../../users/entities/user.entity';
import {
  baseDocDefinition,
  buildCoverBanner,
  buildSignatureBlock,
  caseInfoSection,
  dataTable,
  formatDate,
  participantInfoSection,
  sectionTitle,
  TDocumentDefinitions,
} from '../pdf-shared';

export function buildClosingNoteDoc(
  caseEntity: Case,
  currentUser: User,
): TDocumentDefinitions {
  const closing = caseEntity.closingNote;

  return baseDocDefinition([
    ...buildCoverBanner(
      'NOTA DE CIERRE',
      caseEntity,
      'Documento de cierre del caso.',
    ),
    ...participantInfoSection(caseEntity),
    ...caseInfoSection(caseEntity),

    sectionTitle('Detalles del Cierre'),
    dataTable([
      ['Fecha de cierre', formatDate(closing?.closingDate)],
      ['Motivo de cierre', closing?.reason],
      ['Resumen / Logros', closing?.achievements],
      ['Recomendaciones', closing?.recommendations],
      ['Conclusiones / Observaciones', closing?.observations],
    ]),

    buildSignatureBlock(currentUser),
  ]);
}
