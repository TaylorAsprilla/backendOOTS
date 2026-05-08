/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Case } from '../../../participants/entities/case.entity';
import { User } from '../../../users/entities/user.entity';
import {
  baseDocDefinition,
  buildCoverBanner,
  buildSignatureBlock,
  caseInfoSection,
  dataTable,
  participantInfoSection,
  sectionTitle,
  subItemTitle,
  TDocumentDefinitions,
} from '../pdf-shared';

export function buildInterventionPlanDoc(
  caseEntity: Case,
  currentUser: User,
): TDocumentDefinitions {
  const plans = caseEntity.interventionPlans ?? [];

  const plansContent = plans.length
    ? plans.flatMap((ip, i) => [
        subItemTitle(`${i + 1}. Plan de Intervención`),
        dataTable([
          ['Objetivo general', ip.goal],
          ['Objetivos específicos', ip.objectives],
          ['Actividades', ip.activities],
          ['Cronograma / Tiempos', ip.timeline],
          ['Responsable', ip.responsible],
          ['Criterios de evaluación', ip.evaluationCriteria],
        ]),
      ])
    : [
        {
          text: 'Este caso aún no tiene planes de intervención registrados.',
          fontSize: 9.5,
          italics: true,
          margin: [0, 6, 0, 0],
        },
      ];

  return baseDocDefinition([
    ...buildCoverBanner(
      'PLAN DE INTERVENCIÓN',
      caseEntity,
      'Documento del plan de intervención del caso.',
    ),
    ...participantInfoSection(caseEntity),
    ...caseInfoSection(caseEntity),

    sectionTitle('Plan(es) de Intervención'),
    ...plansContent,

    buildSignatureBlock(currentUser),
  ]);
}
