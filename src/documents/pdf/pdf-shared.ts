/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require('pdfmake/src/printer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vfsFonts: Record<string, string> = require('pdfmake/build/vfs_fonts');

import * as fs from 'fs';
import * as path from 'path';
import { Case } from '../../participants/entities/case.entity';
import { User } from '../../users/entities/user.entity';

export type Content = any;
export type TDocumentDefinitions = any;

// =============================================================================
// Configuración de firmas (placeholder — habilitar en una fase posterior)
// =============================================================================
export const INCLUDE_SIGNATURES = false;

// =============================================================================
// Paleta corporativa OOTS
// =============================================================================
export const PALETTE = {
  NAVY: '#6658dd',
  ACCENT: '#4a3fb5',
  ROW_ODD: '#F3F1FD',
  ROW_EVN: '#FFFFFF',
  LBL: '#212529',
  VAL: '#212529',
  MUTED: '#6c757d',
  BORDER: '#C4BEF0',
  SOFT_BG: '#EDE9FB',
};

// =============================================================================
// Fuentes
// =============================================================================
const fonts = {
  Roboto: {
    normal: Buffer.from(
      vfsFonts['Roboto-Regular.ttf'],
      'base64',
    ) as unknown as string,
    bold: Buffer.from(
      vfsFonts['Roboto-Medium.ttf'],
      'base64',
    ) as unknown as string,
    italics: Buffer.from(
      vfsFonts['Roboto-Italic.ttf'],
      'base64',
    ) as unknown as string,
    bolditalics: Buffer.from(
      vfsFonts['Roboto-MediumItalic.ttf'],
      'base64',
    ) as unknown as string,
  },
};

let cachedPrinter: any | null = null;
export function getPrinter(): any {
  if (!cachedPrinter) {
    cachedPrinter = new PdfPrinter(fonts);
  }
  return cachedPrinter;
}

// =============================================================================
// Logo
// =============================================================================
let cachedLogoDataUrl: string | null = null;
export function getLogoDataUrl(): string {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  try {
    const logoPng = fs.readFileSync(
      path.join(__dirname, '..', '..', 'assets', 'images', 'logo-oots.png'),
    );
    cachedLogoDataUrl = `data:image/png;base64,${logoPng.toString('base64')}`;
  } catch {
    cachedLogoDataUrl = '';
  }
  return cachedLogoDataUrl;
}

// =============================================================================
// Formateadores
// =============================================================================
export const formatDate = (d?: Date | string | null): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const fmt = (value?: string | number | boolean | null): string => {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  const s = String(value);
  return s.length === 0 ? '—' : s;
};

export const fullParticipantName = (caseEntity: Case): string => {
  const p = caseEntity.participant;
  return (
    [p?.firstName, p?.secondName, p?.firstLastName, p?.secondLastName]
      .filter(Boolean)
      .join(' ') || '—'
  );
};

export const fullUserName = (user?: User | null): string => {
  if (!user) return '—';
  return (
    [user.firstName, user.secondName, user.firstLastName, user.secondLastName]
      .filter(Boolean)
      .join(' ') || '—'
  );
};

// =============================================================================
// Helpers visuales reutilizables
// =============================================================================
export const sectionTitle = (title: string): Content => ({
  table: {
    widths: ['*'],
    body: [
      [
        {
          text: title,
          bold: true,
          fontSize: 10.5,
          color: '#FFFFFF',
          margin: [10, 6, 0, 6],
          border: [false, false, false, false],
        },
      ],
    ],
  },
  layout: {
    fillColor: () => PALETTE.NAVY,
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  },
  margin: [0, 18, 0, 0],
});

export const subItemTitle = (text: string): Content => ({
  table: {
    widths: ['*'],
    body: [
      [
        {
          text,
          bold: true,
          fontSize: 9.5,
          color: '#FFFFFF',
          margin: [10, 4, 0, 4],
          border: [false, false, false, false],
        },
      ],
    ],
  },
  layout: {
    fillColor: () => PALETTE.ACCENT,
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  },
  margin: [0, 6, 0, 0],
});

export type Pair = [string, string | number | boolean | null | undefined];

export const dataTable = (pairs: Pair[]): Content => ({
  table: {
    widths: [170, '*'],
    body: pairs.map(([label, value], i) => [
      {
        text: label,
        bold: true,
        fontSize: 9.5,
        color: PALETTE.LBL,
        fillColor: i % 2 === 0 ? PALETTE.ROW_ODD : PALETTE.ROW_EVN,
        margin: [8, 5, 4, 5],
        border: [false, false, false, false],
      },
      {
        text: fmt(value),
        fontSize: 9.5,
        color: PALETTE.VAL,
        fillColor: i % 2 === 0 ? PALETTE.ROW_ODD : PALETTE.ROW_EVN,
        margin: [4, 5, 8, 5],
        border: [false, false, false, false],
      },
    ]),
  },
  layout: {
    hLineWidth: (i: number, node: any) =>
      i === 0 || i === node.table.body.length ? 0.5 : 0.3,
    hLineColor: () => PALETTE.BORDER,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  },
  margin: [0, 2, 0, 4],
});

// =============================================================================
// Encabezado / Pie de página estandarizados
// =============================================================================
export function buildHeader(): Content {
  const logoDataUrl = getLogoDataUrl();
  return {
    stack: [
      {
        canvas: [
          { type: 'rect', x: 0, y: 0, w: 595, h: 3, color: PALETTE.NAVY },
        ],
      },
      logoDataUrl
        ? {
            columns: [
              {
                image: logoDataUrl,
                width: 72,
                margin: [40, 5, 0, 0],
              },
            ],
          }
        : { text: '' },
      {
        canvas: [
          {
            type: 'line',
            x1: 40,
            y1: 0,
            x2: 555,
            y2: 0,
            lineWidth: 0.5,
            lineColor: PALETTE.BORDER,
          },
        ],
        margin: [0, 6, 0, 0],
      },
    ],
  };
}

export function buildFooter() {
  return (currentPage: number, pageCount: number): Content => ({
    stack: [
      {
        canvas: [
          {
            type: 'line',
            x1: 40,
            y1: 0,
            x2: 555,
            y2: 0,
            lineWidth: 0.5,
            lineColor: PALETTE.BORDER,
          },
        ],
        margin: [0, 0, 0, 4],
      },
      {
        columns: [
          {
            stack: [
              {
                text: 'OOTS — Sistema especializado en gestión y documentación de casos.',
                fontSize: 7,
                color: PALETTE.MUTED,
              },
              {
                text: `Generado el ${formatDate(new Date())}`,
                fontSize: 7,
                color: PALETTE.MUTED,
              },
            ],
            margin: [40, 0, 0, 0],
          },
          {
            text: `Página ${currentPage} de ${pageCount}`,
            fontSize: 8,
            bold: true,
            color: PALETTE.ACCENT,
            alignment: 'right',
            margin: [0, 4, 40, 0],
          },
        ],
      },
    ],
  });
}

// =============================================================================
// Banner / Portada de cada documento
// =============================================================================
export function buildCoverBanner(
  documentTitle: string,
  caseEntity: Case,
  subtitle?: string,
): Content[] {
  const logoDataUrl = getLogoDataUrl();
  return [
    {
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: 515,
          h: 6,
          r: 0,
          color: PALETTE.NAVY,
        },
      ],
    },
    {
      columns: [
        {
          stack: [
            ...(logoDataUrl
              ? [{ image: logoDataUrl, width: 90, margin: [0, 10, 0, 4] }]
              : []),
            {
              text: documentTitle,
              fontSize: 20,
              bold: true,
              color: PALETTE.NAVY,
              margin: [0, 0, 0, 2],
            },
            {
              text: subtitle ?? '"Cada caso importa, cada dato cuenta."',
              fontSize: 8,
              italics: true,
              color: PALETTE.ACCENT,
              margin: [0, 0, 0, 14],
            },
          ],
          width: '*',
        },
        {
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: 130,
                  h: 68,
                  r: 4,
                  color: PALETTE.SOFT_BG,
                },
              ],
              margin: [0, 10, 0, 0],
            },
            {
              text: caseEntity.caseNumber ?? `N.° ${caseEntity.id}`,
              fontSize: 14,
              bold: true,
              color: PALETTE.NAVY,
              alignment: 'center',
              margin: [0, -52, 0, 2],
            },
            {
              text: (caseEntity.status ?? '').toUpperCase(),
              fontSize: 8,
              bold: true,
              color: PALETTE.ACCENT,
              alignment: 'center',
            },
          ],
          width: 130,
        },
      ],
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: PALETTE.NAVY,
        },
      ],
      margin: [0, 4, 0, 18],
    },
  ];
}

// =============================================================================
// Bloque opcional de firmas (deshabilitado por configuración)
// =============================================================================
export function buildSignatureBlock(currentUser: User): Content {
  if (!INCLUDE_SIGNATURES) {
    // Espacio reservado: si en el futuro se habilita, se renderizan las firmas.
    return { text: '' };
  }
  return {
    margin: [0, 40, 0, 0],
    columns: [
      {
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 20,
                y1: 0,
                x2: 200,
                y2: 0,
                lineWidth: 1,
                lineColor: PALETTE.NAVY,
              },
            ],
          },
          {
            text: fullUserName(currentUser),
            bold: true,
            fontSize: 9,
            color: PALETTE.NAVY,
            margin: [20, 4, 0, 1],
          },
          {
            text: currentUser.position ?? 'Profesional a cargo',
            fontSize: 8,
            color: PALETTE.ACCENT,
            margin: [20, 0, 0, 1],
          },
          {
            text: currentUser.email ?? '',
            fontSize: 7.5,
            color: PALETTE.MUTED,
            margin: [20, 0, 0, 0],
          },
        ],
        width: 240,
      },
      { width: '*', text: '' },
      {
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 180,
                y2: 0,
                lineWidth: 1,
                lineColor: PALETTE.NAVY,
              },
            ],
          },
          {
            text: 'Firma',
            fontSize: 8,
            color: PALETTE.MUTED,
            alignment: 'center',
            margin: [0, 4, 0, 1],
            width: 180,
          },
          {
            text: formatDate(new Date()),
            fontSize: 8,
            color: PALETTE.ACCENT,
            alignment: 'center',
            width: 180,
          },
        ],
        width: 180,
      },
    ],
  };
}

// =============================================================================
// Renderizado a Buffer
// =============================================================================
export function renderPdfToBuffer(
  docDefinition: TDocumentDefinitions,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const printer = getPrinter();
    const pdfDoc = printer.createPdfKitDocument(docDefinition) as {
      on: (event: string, cb: (arg: Buffer & Error) => void) => void;
      end: () => void;
    };
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', (err: Error) => reject(err));
    pdfDoc.end();
  });
}

// =============================================================================
// Bloques comunes: datos del participante y datos del caso
// =============================================================================
export function participantInfoSection(caseEntity: Case): Content[] {
  const p = caseEntity.participant;
  return [
    sectionTitle('Datos del Participante'),
    dataTable([
      ['Nombre completo', fullParticipantName(caseEntity)],
      [
        'Documento',
        `${p?.documentType?.name ?? ''} ${p?.documentNumber ?? ''}`.trim(),
      ],
      ['Fecha de nacimiento', formatDate(p?.birthDate)],
      ['Género', p?.gender?.name],
      ['Estado civil', p?.maritalStatus?.name],
      ['Teléfono', p?.phoneNumber],
      ['Email', p?.email],
      ['Dirección', p?.address],
      [
        'Ciudad / Departamento',
        [p?.city, p?.state].filter(Boolean).join(' — '),
      ],
      ['EPS / Seguro médico', p?.healthInsurance?.name],
    ]),
  ];
}

export function caseInfoSection(caseEntity: Case): Content[] {
  return [
    sectionTitle('Datos del Caso'),
    dataTable([
      ['Número de caso', caseEntity.caseNumber],
      ['Estado', caseEntity.status],
      ['Fecha de apertura', formatDate(caseEntity.createdAt)],
      ['Última actualización', formatDate(caseEntity.updatedAt)],
      ['Profesional responsable', fullUserName(caseEntity.createdBy)],
      ['Motivo de consulta', caseEntity.consultationReason],
    ]),
  ];
}

// =============================================================================
// Base común para todos los documentos
// =============================================================================
export function baseDocDefinition(content: Content[]): TDocumentDefinitions {
  return {
    pageSize: 'A4',
    pageMargins: [40, 72, 40, 55],
    defaultStyle: { font: 'Roboto' },
    header: buildHeader(),
    footer: buildFooter(),
    content,
  };
}
