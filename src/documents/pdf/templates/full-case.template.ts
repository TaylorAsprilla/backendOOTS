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
  Content,
} from '../pdf-shared';

export function buildFullCaseDoc(
  caseEntity: Case,
  currentUser: User,
): TDocumentDefinitions {
  const bio = caseEntity.bioPsychosocialHistory;
  const phys = caseEntity.physicalHealthHistories?.[0];
  const mental = caseEntity.mentalHealthHistories?.[0];
  const physFamily = caseEntity.familyHealthHistories?.find(
    (f) => f.historyType === 'physical',
  );
  const mentalFamily = caseEntity.familyHealthHistories?.find(
    (f) => f.historyType === 'mental',
  );
  const closing = caseEntity.closingNote;
  const weigh = caseEntity.weighing;

  const situations =
    caseEntity.participantIdentifiedSituations
      ?.map((s) => s.identifiedSituation?.name)
      .filter(Boolean)
      .join(', ') || '—';

  const familyContent: Content[] = (caseEntity.familyMembers ?? []).flatMap(
    (fm, i) => [
      subItemTitle(`${i + 1}. ${fm.name}`),
      dataTable([
        [
          'Relación',
          fm.familyRelationship?.name ?? String(fm.familyRelationshipId),
        ],
        ['Fecha de nacimiento', formatDate(fm.birthDate)],
        ['Ocupación', fm.occupation],
        ['Nivel académico', fm.academicLevel?.name],
      ]),
    ],
  );

  const followUpContent: Content[] = (caseEntity.followUpPlans ?? []).flatMap(
    (fu, i) => [
      subItemTitle(`${i + 1}. Seguimiento`),
      dataTable([
        ['Servicio coordinado', fu.coordinatedService],
        ['Fecha cita', formatDate(fu.appointmentDate)],
        ['Hora cita', fu.appointmentTime],
        ['Referido', fu.referred],
        ['Cita de orientación', fu.orientationAppointment],
        ['Proceso completado', fu.processCompleted],
      ]),
    ],
  );

  // Notas de progreso ordenadas cronológicamente (ascendente por sessionDate)
  const sortedProgress = [...(caseEntity.progressNotes ?? [])].sort((a, b) => {
    const da = a.sessionDate ? new Date(a.sessionDate).getTime() : 0;
    const db = b.sessionDate ? new Date(b.sessionDate).getTime() : 0;
    return da - db;
  });

  const progressContent: Content[] = sortedProgress.flatMap((pn, i) => [
    subItemTitle(`${i + 1}. Sesión del ${formatDate(pn.sessionDate)}`),
    dataTable([
      ['Tipo de abordaje', pn.approachType?.name],
      ['Tipo de proceso', pn.processType?.name],
      ['Proceso', pn.process],
      ['Resumen', pn.summary],
      ['Observaciones', pn.observations],
      ['Acuerdos', pn.agreements],
    ]),
  ]);

  const interventionContent: Content[] = (
    caseEntity.interventionPlans ?? []
  ).flatMap((ip, i) => [
    subItemTitle(`${i + 1}. Plan`),
    dataTable([
      ['Meta', ip.goal],
      ['Objetivos', ip.objectives],
      ['Actividades', ip.activities],
      ['Cronograma', ip.timeline],
      ['Responsable', ip.responsible],
      ['Criterios de evaluación', ip.evaluationCriteria],
    ]),
  ]);

  return baseDocDefinition([
    ...buildCoverBanner(
      'INFORME COMPLETO DEL CASO',
      caseEntity,
      'Documento consolidado con toda la información del caso.',
    ),
    ...participantInfoSection(caseEntity),

    sectionTitle('Información del Caso'),
    dataTable([
      ['Número de caso', caseEntity.caseNumber],
      ['Estado', caseEntity.status],
      ['Motivo de consulta', caseEntity.consultationReason],
      ['Intervención inicial', caseEntity.intervention],
      ['Referidos', caseEntity.referrals],
      ['Situaciones identificadas', situations],
      ['Fecha de creación', formatDate(caseEntity.createdAt)],
      ['Última actualización', formatDate(caseEntity.updatedAt)],
      [
        'Fecha de cierre',
        closing?.closingDate ? formatDate(closing.closingDate) : '—',
      ],
    ]),
    ...caseInfoSection(caseEntity).slice(0, 0), // (caseInfoSection ya cubre algunos; evitamos duplicar)

    ...(bio
      ? [
          sectionTitle('Historia Biopsicosocial'),
          dataTable([
            ['Nivel académico', bio.academicLevel?.name ?? bio.completedGrade],
            ['Institución', bio.institution],
            ['Profesión', bio.profession],
            ['Historia ocupacional', bio.occupationalHistory],
            ['Vivienda', bio.housing],
            ['Tipo de vivienda', bio.housingType?.name],
            ['Fuente de ingreso', bio.incomeSource?.name],
            ['Nivel de ingreso', bio.incomeLevel?.name],
          ]),
        ]
      : []),

    ...(phys
      ? [
          sectionTitle('Salud Física'),
          dataTable([
            ['Condiciones actuales', phys.currentConditions],
            ['Medicamentos', phys.medications],
            ['Observaciones', phys.observations],
          ]),
        ]
      : []),

    ...(physFamily
      ? [
          sectionTitle('Antecedentes Familiares (Salud Física)'),
          dataTable([
            ['Antecedentes (padre)', physFamily.familyHistoryFather],
            ['Antecedentes (madre)', physFamily.familyHistoryMother],
          ]),
        ]
      : []),

    ...(mental
      ? [
          sectionTitle('Salud Mental'),
          dataTable([
            ['Condiciones actuales', mental.currentConditions],
            ['Medicamentos', mental.medications],
            ['Observaciones', mental.observations],
          ]),
        ]
      : []),

    ...(mentalFamily
      ? [
          sectionTitle('Antecedentes Familiares (Salud Mental)'),
          dataTable([
            ['Antecedentes (padre)', mentalFamily.familyHistoryFather],
            ['Antecedentes (madre)', mentalFamily.familyHistoryMother],
          ]),
        ]
      : []),

    ...(weigh
      ? [
          sectionTitle('Ponderación'),
          dataTable([
            ['Motivo de consulta', weigh.reasonConsultation],
            ['Situación identificada', weigh.identifiedSituation],
            ['Condiciones favorables', weigh.favorableConditions],
            ['Condiciones no favorables', weigh.conditionsNotFavorable],
            ['Proceso de ayuda', weigh.helpProcess],
          ]),
        ]
      : []),

    ...(familyContent.length
      ? [sectionTitle('Grupo Familiar'), ...familyContent]
      : []),

    ...(followUpContent.length
      ? [
          sectionTitle('Plan de Seguimiento / Proceso de Ayuda'),
          ...followUpContent,
        ]
      : []),

    ...(interventionContent.length
      ? [sectionTitle('Planes de Intervención'), ...interventionContent]
      : []),

    ...(progressContent.length
      ? [
          sectionTitle('Notas de Progreso (orden cronológico)'),
          ...progressContent,
        ]
      : []),

    ...(closing
      ? [
          sectionTitle('Nota de Cierre'),
          dataTable([
            ['Razón de cierre', closing.reason],
            ['Logros', closing.achievements],
            ['Recomendaciones', closing.recommendations],
            ['Observaciones', closing.observations],
            ['Fecha de cierre', formatDate(closing.closingDate)],
          ]),
        ]
      : []),

    buildSignatureBlock(currentUser),
  ]);
}
