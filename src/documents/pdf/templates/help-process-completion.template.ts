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
  subItemTitle,
  TDocumentDefinitions,
} from '../pdf-shared';

export function buildHelpProcessCompletionDoc(
  caseEntity: Case,
  currentUser: User,
): TDocumentDefinitions {
  const completedFollowUps = (caseEntity.followUpPlans ?? []).filter(
    (f) => f.processCompleted,
  );

  const followUpContent = completedFollowUps.length
    ? completedFollowUps.flatMap((fu, i) => [
        subItemTitle(`${i + 1}. Seguimiento culminado`),
        dataTable([
          ['Fecha de cita', formatDate(fu.appointmentDate)],
          ['Hora de cita', fu.appointmentTime],
          ['Servicio coordinado', fu.coordinatedService],
          ['Cita de orientación', fu.orientationAppointment],
          ['Referido', fu.referred],
          ['Detalles del referido', fu.referralDetails],
          ['Otros detalles', fu.otherDetails],
        ]),
      ])
    : [
        {
          text: 'No se registraron seguimientos marcados como culminados.',
          fontSize: 9.5,
          italics: true,
          margin: [0, 6, 0, 0],
        },
      ];

  return baseDocDefinition([
    ...buildCoverBanner(
      'CULMINACIÓN DEL PROCESO DE AYUDA',
      caseEntity,
      'Documento de cierre del proceso de acompañamiento.',
    ),
    ...participantInfoSection(caseEntity),
    ...caseInfoSection(caseEntity),

    sectionTitle('Estado de Culminación'),
    dataTable([
      ['Estado actual del caso', caseEntity.status],
      ['Fecha de generación', formatDate(new Date())],
      [
        'Seguimientos culminados',
        completedFollowUps.length || 'Ninguno registrado',
      ],
    ]),

    sectionTitle('Detalles del Proceso de Ayuda'),
    ...followUpContent,

    buildSignatureBlock(currentUser),
  ]);
}
