import { Case } from '../../../participants/entities/case.entity';
import {
  CaseTransfer,
  TransferStatus,
} from '../../../cases/entities/case-transfer.entity';
import {
  baseDocDefinition,
  buildCoverBanner,
  dataTable,
  formatDate,
  fullParticipantName,
  fullUserName,
  sectionTitle,
  TDocumentDefinitions,
} from '../pdf-shared';

const STATUS_LABEL: Record<TransferStatus, string> = {
  [TransferStatus.AWAITING_REPORT]: 'Informe por elaborar',
  [TransferStatus.PENDING]: 'Pendiente de aprobación',
  [TransferStatus.APPROVED]: 'Aprobado',
  [TransferStatus.REJECTED]: 'Rechazado',
};

const textBlock = (value?: string | null) => ({
  text: value?.trim() || '—',
  fontSize: 9.5,
  margin: [8, 6, 8, 4],
  alignment: 'justify',
});

/**
 * Informe de transferencia (formulario 27). Las firmas del formulario en papel
 * se reemplazan por el registro de quién elaboró y quién aprobó en el sistema.
 */
export function buildTransferReportDoc(
  caseEntity: Case,
  transfer: CaseTransfer,
): TDocumentDefinitions {
  const reviewed =
    transfer.status === TransferStatus.APPROVED ||
    transfer.status === TransferStatus.REJECTED;
  // Registros anteriores al flujo en 4 pasos no tienen autor del informe
  const author = transfer.reportedBy ?? transfer.transferredBy;
  const authoredAt = transfer.reportedAt ?? transfer.createdAt;

  return baseDocDefinition(
    [
      ...buildCoverBanner(
        'INFORME DE TRANSFERENCIA',
        caseEntity,
        'Oficina de Orientación y Trabajo Social de la Congregación Mita, Inc.',
      ),
      dataTable([
        ['Núm. de expediente', caseEntity.caseNumber ?? caseEntity.id],
        ['Nombre del(la) participante', fullParticipantName(caseEntity)],
        ['Fecha', formatDate(transfer.createdAt)],
        ['Profesional que transfiere', fullUserName(transfer.fromUser)],
        ['Profesional que recibe', fullUserName(transfer.toUser)],
      ]),

      sectionTitle('RESUMEN DE LA LABOR REALIZADA'),
      textBlock(transfer.workSummary),
      sectionTitle('PONDERACIÓN'),
      textBlock(transfer.assessment),
      sectionTitle('LOGROS'),
      textBlock(transfer.achievements),
      sectionTitle('MOTIVO DE LA TRANSFERENCIA'),
      textBlock(transfer.reason),
      sectionTitle('RECOMENDACIONES'),
      textBlock(transfer.recommendations),

      sectionTitle('APROBACIÓN'),
      dataTable([
        ['Solicitado por', fullUserName(transfer.transferredBy)],
        ['Fecha de la solicitud', formatDate(transfer.createdAt)],
        ['Elaborado por (Trabajo Social)', fullUserName(author)],
        ['Fecha de elaboración', formatDate(authoredAt)],
        ['Estado', STATUS_LABEL[transfer.status] ?? transfer.status],
        ...(reviewed
          ? ([
              [
                transfer.status === TransferStatus.APPROVED
                  ? 'Aprobado por (Supervisión)'
                  : 'Rechazado por (Supervisión)',
                fullUserName(transfer.reviewedBy),
              ],
              ['Fecha de la revisión', formatDate(transfer.reviewedAt)],
              ['Observación', transfer.reviewNote],
            ] as Array<[string, string | number | null | undefined]>)
          : []),
      ]),
    ],
    transfer.createdAt,
  );
}
