import { CaseStatus } from '../common/enums';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import { PdfService } from './pdf.service';

describe('PdfService', () => {
  it('generates a case PDF using the available logo asset path', async () => {
    const service = new PdfService();
    const caseEntity = Object.assign(new Case(), {
      id: 36,
      status: CaseStatus.OPEN,
    });

    const pdf = await service.generateCasePdf(caseEntity, new User());

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });
});
