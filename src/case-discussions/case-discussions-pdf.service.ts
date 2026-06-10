/* eslint-disable @typescript-eslint/no-require-imports */
const PdfPrinter = require('pdfmake/src/printer');
const vfsFonts: Record<string, string> = require('pdfmake/build/vfs_fonts');

import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { CaseDiscussion } from './entities/case-discussion.entity';

type Content = any;
type TDocumentDefinitions = any;

const fonts = {
  Roboto: {
    normal: Buffer.from(vfsFonts['Roboto-Regular.ttf'], 'base64') as unknown as string,
    bold: Buffer.from(vfsFonts['Roboto-Medium.ttf'], 'base64') as unknown as string,
    italics: Buffer.from(vfsFonts['Roboto-Italic.ttf'], 'base64') as unknown as string,
    bolditalics: Buffer.from(vfsFonts['Roboto-MediumItalic.ttf'], 'base64') as unknown as string,
  },
};

@Injectable()
export class CaseDiscussionsPdfService {
  private createPrinter() {
    return new PdfPrinter(fonts);
  }

  async generateDiscussionPdf(
    discussion: CaseDiscussion,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const logoPath = path.join(__dirname, '..', 'assets', 'images', 'logo-oots.png');
    const logoPng = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;
    const logoDataUrl = logoPng
      ? `data:image/png;base64,${logoPng.toString('base64')}`
      : undefined;

    const formatDate = (value?: Date | string | null): string => {
      if (!value) return '—';
      return new Date(value).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatDateTime = (value?: Date | string | null): string => {
      if (!value) return '—';
      return new Date(value).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const fullName = (person?: {
      firstName?: string;
      secondName?: string;
      firstLastName?: string;
      secondLastName?: string;
    }): string =>
      [
        person?.firstName,
        person?.secondName,
        person?.firstLastName,
        person?.secondLastName,
      ]
        .filter(Boolean)
        .join(' ') || '—';

    const row = (
      label: string,
      value?: string | number | null,
    ): Array<{ text: string | number; bold?: boolean; fillColor?: string; margin?: number[] }> => [
      {
        text: label,
        bold: true,
        fillColor: '#EFE7DA',
        margin: [6, 5, 6, 5],
      },
      {
        text: value ?? '—',
        fillColor: '#FFFFFF',
        margin: [6, 5, 6, 5],
      },
    ];

    const sectionTitle = (text: string): Content => ({
      text,
      bold: true,
      fontSize: 11,
      color: '#6B4C2C',
      margin: [0, 14, 0, 6],
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
      },
      watermark:
        discussion.status === 'BORRADOR'
          ? {
              text: 'BORRADOR',
              color: '#B71C1C',
              opacity: 0.12,
              bold: true,
            }
          : undefined,
      content: [
        {
          columns: [
            logoDataUrl
              ? {
                  image: logoDataUrl,
                  width: 58,
                }
              : { text: '' },
            {
              width: '*',
              stack: [
                {
                  text: 'Oficina de Orientación y Asistencia Social',
                  bold: true,
                  fontSize: 14,
                  alignment: 'center',
                },
                {
                  text: 'Congregación Mita, Inc.',
                  fontSize: 11,
                  alignment: 'center',
                  margin: [0, 2, 0, 0],
                },
                {
                  text: 'Discusión de Casos con el/la Supervisor(a)',
                  bold: true,
                  fontSize: 13,
                  alignment: 'center',
                  margin: [0, 10, 0, 0],
                },
              ],
            },
            { text: '' },
          ],
        },
        sectionTitle('Información general'),
        {
          table: {
            widths: [170, '*'],
            body: [
              row('Caso asociado', discussion.case?.caseNumber ?? `Caso #${discussion.caseId}`),
              row('Participante/cliente asociado', discussion.clientNameSnapshot),
              row('Trabajador social o manejador del caso', fullName(discussion.socialWorker)),
              row('Supervisor', fullName(discussion.supervisor)),
              row('Fecha de discusión', formatDate(discussion.discussionDate)),
              row('Estado', discussion.status),
            ],
          },
          layout: 'lightHorizontalLines',
        },
        sectionTitle('Datos del cliente'),
        {
          table: {
            widths: [170, '*'],
            body: [
              row('Nombre del cliente', discussion.clientNameSnapshot),
              row('Edad', discussion.clientAgeSnapshot ?? '—'),
              row('Sexo', discussion.clientGenderSnapshot),
              row('Estado civil', discussion.clientMaritalStatusSnapshot),
            ],
          },
          layout: 'lightHorizontalLines',
        },
        sectionTitle('Composición familiar'),
        discussion.familyMembers?.length
          ? {
              table: {
                headerRows: 1,
                widths: ['*', 50, 90, 110],
                body: [
                  [
                    { text: 'Nombre', bold: true, fillColor: '#EFE7DA' },
                    { text: 'Edad', bold: true, fillColor: '#EFE7DA' },
                    { text: 'Parentesco', bold: true, fillColor: '#EFE7DA' },
                    { text: 'Ocupación', bold: true, fillColor: '#EFE7DA' },
                  ],
                  ...discussion.familyMembers
                    .slice()
                    .sort((left, right) => left.sortOrder - right.sortOrder)
                    .map((familyMember) => [
                      familyMember.name,
                      familyMember.age ?? '—',
                      familyMember.relationship,
                      familyMember.occupation ?? '—',
                    ]),
                ],
              },
              layout: 'lightHorizontalLines',
            }
          : {
              text: 'No se registró composición familiar para esta discusión.',
              italics: true,
            },
        sectionTitle('Situaciones que presenta'),
        {
          text: discussion.presentedSituations || '—',
          margin: [0, 0, 0, 6],
        },
        sectionTitle('Personas más afectadas'),
        {
          text: discussion.affectedPeople || '—',
          margin: [0, 0, 0, 6],
        },
        sectionTitle('Recomendaciones del trabajador social'),
        {
          text: discussion.socialWorkerRecommendations || '—',
          margin: [0, 0, 0, 6],
        },
        sectionTitle('Recomendaciones del supervisor'),
        {
          text: discussion.supervisorRecommendations || '—',
          margin: [0, 0, 0, 6],
        },
        sectionTitle('Auditoría'),
        {
          table: {
            widths: [170, '*'],
            body: [
              row('Creado por', fullName(discussion.createdBy)),
              row('Fecha de creación', formatDateTime(discussion.createdAt)),
              row('Actualizado por', fullName(discussion.updatedBy)),
              row('Fecha de actualización', formatDateTime(discussion.updatedAt)),
              row('Finalizado por', fullName(discussion.finalizedBy)),
              row('Fecha de finalización', formatDateTime(discussion.finalizedAt)),
              row('Anulado por', fullName(discussion.annulledBy)),
              row('Fecha de anulación', formatDateTime(discussion.annulledAt)),
              row('Motivo de anulación', discussion.annulmentReason),
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          margin: [0, 30, 0, 0],
          columns: [
            {
              width: '*',
              stack: [
                {
                  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }],
                  margin: [0, 20, 0, 6],
                },
                {
                  text: 'Firma trabajador social / manejador del caso',
                  alignment: 'center',
                },
              ],
            },
            {
              width: 40,
              text: '',
            },
            {
              width: '*',
              stack: [
                {
                  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }],
                  margin: [0, 20, 0, 6],
                },
                {
                  text: 'Firma supervisor(a)',
                  alignment: 'center',
                },
              ],
            },
          ],
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'right',
        margin: [0, 10, 40, 0],
        fontSize: 8,
      }),
    };

    const printer = this.createPrinter();
    const pdfDoc = printer.createPdfKitDocument(docDefinition) as {
      on: (event: string, callback: (chunk: Buffer) => void) => void;
      end: () => void;
    };

    return await new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename: `discusion-caso-${discussion.caseId}-${discussion.id}.pdf`,
        });
      });
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}