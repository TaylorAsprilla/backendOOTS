import { Case } from '../../../participants/entities/case.entity';
import { SupervisionReview } from '../../../supervision/supervision-review.entity';
import {
  ItemStatus,
  ReviewStatus,
  ReviewType,
} from '../../../supervision/supervision.catalog';
import { renderPdfToBuffer } from '../pdf-shared';
import { buildSupervisionReviewDoc } from './supervision-review.template';

describe('buildSupervisionReviewDoc', () => {
  const base = {
    id: 1,
    reviewer: { firstName: 'Sara', firstLastName: 'Lopez' },
    items: { attendance_record: ItemStatus.COMPLETE },
    recommendations: 'Completar la hoja de supervisión',
    status: ReviewStatus.SIGNED,
    createdAt: new Date('2026-11-18'),
    signedAt: new Date('2026-11-19'),
  };

  it('renders the supervisee file review', async () => {
    const review = Object.assign(new SupervisionReview(), {
      ...base,
      type: ReviewType.SUPERVISEE_FILE,
      supervisee: { firstName: 'Ana', firstLastName: 'Perez' },
      casesCount: 12,
      period: '2026-11',
    });
    const buffer = await renderPdfToBuffer(buildSupervisionReviewDoc(review));
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('renders the participant file review as a draft', async () => {
    const review = Object.assign(new SupervisionReview(), {
      ...base,
      type: ReviewType.CASE_FILE,
      status: ReviewStatus.DRAFT,
      signedAt: null,
      case: Object.assign(new Case(), {
        id: 4,
        caseNumber: 'EXP-4',
        participant: { firstName: 'Ana', firstLastName: 'Perez' },
      }),
    });
    const buffer = await renderPdfToBuffer(buildSupervisionReviewDoc(review));
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
