/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require('pdfmake/src/printer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vfsFonts: Record<string, string> = require('pdfmake/build/vfs_fonts');

import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';

type Content = any;
type TDocumentDefinitions = any;

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

@Injectable()
export class PdfService {
  private createPrinter() {
    return new PdfPrinter(fonts);
  }

  generateCasePdf(caseEntity: Case, currentUser: User): Promise<Buffer> {
    const p = caseEntity.participant;
    const fullName = [
      p?.firstName,
      p?.secondName,
      p?.firstLastName,
      p?.secondLastName,
    ]
      .filter(Boolean)
      .join(' ');

    // ── Paleta corporativa OOTS ───────────────────────────────────────────────
    const NAVY = '#6658dd'; // morado corporativo — barras de sección, títulos
    const ACCENT = '#4a3fb5'; // morado oscuro — barras secundarias, acentos
    const ROW_ODD = '#F3F1FD'; // lila muy suave — filas alternas
    const ROW_EVN = '#FFFFFF'; // blanco puro
    const LBL = '#212529'; // casi negro — etiquetas (máx. legibilidad)
    const VAL = '#212529'; // casi negro — valores
    const MUTED = '#6c757d'; // gris medio — textos secundarios y pie de página
    const BORDER = '#C4BEF0'; // lila claro — bordes de tabla
    const logoPng = fs.readFileSync(
      path.join(__dirname, '..', 'assets', 'images', 'logo-oots.png'),
    );
    const logoDataUrl = `data:image/png;base64,${logoPng.toString('base64')}`;

    const formatDate = (d?: Date | string | null): string => {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const fmt = (value?: string | number | boolean | null): string => {
      if (value === undefined || value === null) return '—';
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      return String(value) || '—';
    };

    // ── Barra de título de sección ────────────────────────────────────────────
    const sectionTitle = (title: string): Content => ({
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
        fillColor: () => NAVY,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 18, 0, 0],
    });

    // ── Tabla de datos con filas alternas ─────────────────────────────────────
    type Pair = [string, string | number | boolean | null | undefined];
    const dataTable = (pairs: Pair[]): Content => ({
      table: {
        widths: [170, '*'],
        body: pairs.map(([label, value], i) => [
          {
            text: label,
            bold: true,
            fontSize: 9.5,
            color: LBL,
            fillColor: i % 2 === 0 ? ROW_ODD : ROW_EVN,
            margin: [8, 5, 4, 5],
            border: [false, false, false, false],
          },
          {
            text: fmt(value),
            fontSize: 9.5,
            color: VAL,
            fillColor: i % 2 === 0 ? ROW_ODD : ROW_EVN,
            margin: [4, 5, 8, 5],
            border: [false, false, false, false],
          },
        ]),
      },
      layout: {
        hLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.body.length ? 0.5 : 0.3,
        hLineColor: () => BORDER,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 2, 0, 4],
    });

    // ── Barra de sub-elemento (familiar, seguimiento, etc.) ───────────────────
    const subItemTitle = (text: string): Content => ({
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
        fillColor: () => ACCENT,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 6, 0, 0],
    });

    // ── Datos relacionados ────────────────────────────────────────────────────
    const situations =
      caseEntity.participantIdentifiedSituations
        ?.map((s) => s.identifiedSituation?.name)
        .filter(Boolean)
        .join(', ') || '—';

    const bio = caseEntity.bioPsychosocialHistory;
    const phys = caseEntity.physicalHealthHistories?.[0];
    const mental = caseEntity.mentalHealthHistories?.[0];
    const closing = caseEntity.closingNote;
    const weigh = caseEntity.weighing;

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

    const progressContent: Content[] = (caseEntity.progressNotes ?? []).flatMap(
      (pn, i) => [
        subItemTitle(`${i + 1}. Sesión del ${formatDate(pn.sessionDate)}`),
        dataTable([
          ['Tipo de abordaje', pn.approachType?.name],
          ['Tipo de proceso', pn.processType?.name],
          ['Proceso', pn.process],
          ['Resumen', pn.summary],
          ['Observaciones', pn.observations],
          ['Acuerdos', pn.agreements],
        ]),
      ],
    );

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

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 72, 40, 55],
      defaultStyle: { font: 'Roboto' },

      // ── Encabezado ──────────────────────────────────────────────────────────
      header: {
        stack: [
          {
            canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 3, color: NAVY }],
          },
          {
            columns: [
              {
                image: logoDataUrl,
                width: 72,
                margin: [40, 5, 0, 0],
              },
            ],
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 40,
                y1: 0,
                x2: 555,
                y2: 0,
                lineWidth: 0.5,
                lineColor: BORDER,
              },
            ],
            margin: [0, 6, 0, 0],
          },
        ],
      },

      // ── Pie de página ────────────────────────────────────────────────────────
      footer: (currentPage: number, pageCount: number) => ({
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
                lineColor: BORDER,
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
                    color: MUTED,
                  },
                  {
                    text: `Generado el ${formatDate(new Date())}`,
                    fontSize: 7,
                    color: MUTED,
                  },
                ],
                margin: [40, 0, 0, 0],
              },
              {
                text: `Página ${currentPage} de ${pageCount}`,
                fontSize: 8,
                bold: true,
                color: ACCENT,
                alignment: 'right',
                margin: [0, 4, 40, 0],
              },
            ],
          },
        ],
      }),

      // ── Contenido ─────────────────────────────────────────────────────────────
      content: [
        // Portada / Banner
        {
          canvas: [
            { type: 'rect', x: 0, y: 0, w: 515, h: 6, r: 0, color: NAVY },
          ],
        },
        {
          columns: [
            {
              stack: [
                {
                  image: logoDataUrl,
                  width: 90,
                  margin: [0, 10, 0, 4],
                },
                {
                  text: 'INFORME DE CASO',
                  fontSize: 22,
                  bold: true,
                  color: NAVY,
                  margin: [0, 0, 0, 2],
                },
                {
                  text: '"Cada caso importa, cada dato cuenta."',
                  fontSize: 8,
                  italics: true,
                  color: ACCENT,
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
                      color: '#EDE9FB',
                    },
                  ],
                  margin: [0, 10, 0, 0],
                },
                {
                  text: `N.° ${caseEntity.id}`,
                  fontSize: 18,
                  bold: true,
                  color: NAVY,
                  alignment: 'center',
                  margin: [0, -52, 0, 2],
                },
                {
                  text: (caseEntity.status ?? '').toUpperCase(),
                  fontSize: 8,
                  bold: true,
                  color: ACCENT,
                  alignment: 'center',
                  margin: [0, 0, 0, 0],
                },
              ],
              width: 130,
            },
          ],
          margin: [0, 0, 0, 0],
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
              lineColor: NAVY,
            },
          ],
          margin: [0, 4, 0, 18],
        },

        // 1. Información del Caso
        sectionTitle('1. Información del Caso'),
        dataTable([
          ['Número de caso', caseEntity.id],
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

        // 2. Datos del Participante
        sectionTitle('2. Datos del Participante'),
        dataTable([
          ['Nombre completo', fullName],
          [
            'Documento',
            `${p?.documentType?.name ?? ''} ${p?.documentNumber ?? ''}`,
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
          ['Afiliación religiosa', p?.religiousAffiliation],
          ['EPS / Seguro médico', p?.healthInsurance?.name],
          ['Fuente de remisión', p?.referralSource],
        ]),

        // 3. Historia Biopsicosocial
        ...(bio
          ? [
              sectionTitle('3. Historia Biopsicosocial'),
              dataTable([
                [
                  'Nivel académico',
                  bio.academicLevel?.name ?? bio.completedGrade,
                ],
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

        // 4. Salud Física
        ...(phys
          ? [
              sectionTitle('4. Salud Física'),
              dataTable([
                ['Condiciones actuales', phys.currentConditions],
                ['Medicamentos', phys.medications],
                ['Antecedentes (padre)', phys.familyHistoryFather],
                ['Antecedentes (madre)', phys.familyHistoryMother],
                ['Observaciones', phys.observations],
              ]),
            ]
          : []),

        // 5. Salud Mental
        ...(mental
          ? [
              sectionTitle('5. Salud Mental'),
              dataTable([
                ['Condiciones actuales', mental.currentConditions],
                ['Medicamentos', mental.medications],
                ['Antecedentes (padre)', mental.familyHistoryFather],
                ['Antecedentes (madre)', mental.familyHistoryMother],
                ['Observaciones', mental.observations],
              ]),
            ]
          : []),

        // 6. Ponderación
        ...(weigh
          ? [
              sectionTitle('6. Ponderación'),
              dataTable([
                ['Motivo de consulta', weigh.reasonConsultation],
                ['Situación identificada', weigh.identifiedSituation],
                ['Condiciones favorables', weigh.favorableConditions],
                ['Condiciones no favorables', weigh.conditionsNotFavorable],
                ['Proceso de ayuda', weigh.helpProcess],
              ]),
            ]
          : []),

        // 7. Grupo Familiar
        ...(familyContent.length
          ? [sectionTitle('7. Grupo Familiar'), ...familyContent]
          : []),

        // 8. Plan de Seguimiento
        ...(followUpContent.length
          ? [sectionTitle('8. Plan de Seguimiento'), ...followUpContent]
          : []),

        // 9. Planes de Intervención
        ...(interventionContent.length
          ? [sectionTitle('9. Planes de Intervención'), ...interventionContent]
          : []),

        // 10. Notas de Progreso
        ...(progressContent.length
          ? [sectionTitle('10. Notas de Progreso'), ...progressContent]
          : []),

        // 11. Nota de Cierre
        ...(closing
          ? [
              sectionTitle('11. Nota de Cierre'),
              dataTable([
                ['Razón de cierre', closing.reason],
                ['Logros', closing.achievements],
                ['Recomendaciones', closing.recommendations],
                ['Observaciones', closing.observations],
                ['Fecha de cierre', formatDate(closing.closingDate)],
              ]),
            ]
          : []),

        // 12. Firma del profesional
        {
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
                      lineColor: NAVY,
                    },
                  ],
                },
                {
                  text: [
                    {
                      text:
                        [
                          currentUser.firstName,
                          currentUser.secondName,
                          currentUser.firstLastName,
                          currentUser.secondLastName,
                        ]
                          .filter(Boolean)
                          .join(' ') || '—',
                      bold: true,
                      fontSize: 9,
                      color: NAVY,
                    },
                  ],
                  margin: [20, 4, 0, 1],
                },
                {
                  text: currentUser.position ?? 'Profesional a cargo',
                  fontSize: 8,
                  color: ACCENT,
                  margin: [20, 0, 0, 1],
                },
                {
                  text: currentUser.email ?? '',
                  fontSize: 7.5,
                  color: MUTED,
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
                      lineColor: NAVY,
                    },
                  ],
                },
                {
                  text: 'Firma',
                  fontSize: 8,
                  color: MUTED,
                  alignment: 'center',
                  margin: [0, 4, 0, 1],
                  width: 180,
                },
                {
                  text: formatDate(new Date()),
                  fontSize: 8,
                  color: ACCENT,
                  alignment: 'center',
                  margin: [0, 0, 0, 0],
                  width: 180,
                },
              ],
              width: 180,
            },
          ],
        },
      ],
    };

    return new Promise<Buffer>((resolve, reject) => {
      const printer = this.createPrinter();
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
}
