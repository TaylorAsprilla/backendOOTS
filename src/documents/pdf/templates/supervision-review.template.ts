import { SupervisionReview } from '../../../supervision/supervision-review.entity';
import {
  CATALOG,
  ITEM_STATUS_LABEL,
  ItemStatus,
  ReviewStatus,
  ReviewType,
} from '../../../supervision/supervision.catalog';
import {
  PALETTE,
  baseDocDefinition,
  dataTable,
  formatDate,
  fullParticipantName,
  fullUserName,
  sectionTitle,
  TDocumentDefinitions,
} from '../pdf-shared';

/** La fuente Roboto del PDF no trae la marca ✓ */
const pdfSymbol = (symbol: string) => (symbol === '✓' ? 'OK' : symbol);

/**
 * Orden de Expediente / Orden de Expediente de Supervisión. Las firmas del
 * formato en papel se reemplazan por el registro de quién firmó y cuándo.
 */
export function buildSupervisionReviewDoc(
  review: SupervisionReview,
): TDocumentDefinitions {
  const isCase = review.type === ReviewType.CASE_FILE;
  const title = isCase
    ? 'ORDEN DE EXPEDIENTE'
    : 'ORDEN DE EXPEDIENTE DE SUPERVISIÓN';
  const purpose = isCase
    ? 'Con el propósito de establecer un control de calidad en los expedientes.'
    : 'Con el propósito de establecer un control de calidad en los expedientes del supervisado.';

  const header = [
    {
      text: 'Oficina de Orientación y Trabajo Social de la Congregación Mita, Inc.',
      fontSize: 9,
      color: PALETTE.MUTED,
    },
    {
      text: title,
      fontSize: 18,
      bold: true,
      color: PALETTE.NAVY,
      margin: [0, 4, 0, 2],
    },
    { text: purpose, fontSize: 9, italics: true, margin: [0, 0, 0, 12] },
  ];

  const identity = isCase
    ? dataTable([
        ['Expediente #', review.case?.caseNumber ?? review.caseId],
        [
          'Participante',
          review.case ? fullParticipantName(review.case) : undefined,
        ],
      ])
    : dataTable([
        ['Nombre del supervisado', fullUserName(review.supervisee)],
        ['Cantidad de casos', review.casesCount],
        ['Al mes de', review.period],
      ]);

  const groups = new Map<string, (typeof CATALOG)[ReviewType]>();
  for (const item of CATALOG[review.type]) {
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }
  const statusText = (key: string) => {
    const value = review.items?.[key] as ItemStatus | undefined;
    return value ? pdfSymbol(ITEM_STATUS_LABEL[value].symbol) : '';
  };
  const checklist = {
    table: {
      widths: ['*', 40],
      headerRows: 1,
      body: [
        [
          { text: 'Documento', bold: true, fillColor: PALETTE.SOFT_BG },
          {
            text: 'Estado',
            bold: true,
            alignment: 'center',
            fillColor: PALETTE.SOFT_BG,
          },
        ],
        ...[...groups.values()].flatMap((items) =>
          items.map((item) => [
            { text: item.label, fontSize: 9 },
            {
              text: statusText(item.key),
              alignment: 'center',
              bold: true,
              fontSize: 9,
            },
          ]),
        ),
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 10],
  };

  const legend = {
    text: Object.values(ITEM_STATUS_LABEL)
      .map((entry) => `${pdfSymbol(entry.symbol)} ${entry.label}`)
      .join('   ·   '),
    fontSize: 8,
    color: PALETTE.MUTED,
    margin: [0, 0, 0, 8],
  };

  const signed = review.status === ReviewStatus.SIGNED;

  return baseDocDefinition(
    [
      ...header,
      identity,
      sectionTitle('LISTA DE REVISIÓN'),
      checklist,
      legend,
      sectionTitle('RECOMENDACIONES'),
      {
        text: review.recommendations?.trim() || '—',
        fontSize: 9.5,
        margin: [8, 6, 8, 8],
        alignment: 'justify',
      },
      sectionTitle('FIRMA'),
      dataTable([
        [
          isCase ? 'Revisado por' : 'Nombre del supervisor',
          fullUserName(review.reviewer),
        ],
        ['Estado', signed ? 'Firmada' : 'Borrador (sin firmar)'],
        ['Fecha de la firma', signed ? formatDate(review.signedAt) : '—'],
      ]),
    ],
    review.signedAt ?? review.createdAt,
  );
}
