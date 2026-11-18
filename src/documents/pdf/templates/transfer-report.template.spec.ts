import { Case } from '../../../participants/entities/case.entity';
import {
  CaseTransfer,
  TransferStatus,
} from '../../../cases/entities/case-transfer.entity';
import { renderPdfToBuffer } from '../pdf-shared';
import { buildTransferReportDoc } from './transfer-report.template';

describe('buildTransferReportDoc', () => {
  it('renders a PDF with the report and its approval', async () => {
    const caseEntity = Object.assign(new Case(), {
      id: 4,
      caseNumber: 'EXP-4',
      participant: { firstName: 'Ana', firstLastName: 'Perez' },
    });
    const transfer = Object.assign(new CaseTransfer(), {
      id: 9,
      workSummary: 'Resumen',
      assessment: 'Ponderación',
      achievements: 'Logros',
      recommendations: 'Recomendaciones',
      reason: 'Traslado',
      status: TransferStatus.APPROVED,
      createdAt: new Date('2026-11-18'),
      reviewedAt: new Date('2026-11-19'),
    });
    const buffer = await renderPdfToBuffer(
      buildTransferReportDoc(caseEntity, transfer),
    );
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
