import { ForbiddenException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../common/enums';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { FamilyMember } from '../participants/entities/family-member.entity';
import { User } from '../users/entities/user.entity';
import { CaseDocumentHistoryService } from '../cases/case-document-history.service';
import { CaseDiscussionsService } from './case-discussions.service';
import { CaseDiscussionsPdfService } from './case-discussions-pdf.service';
import { CaseDiscussion } from './entities/case-discussion.entity';
import { CaseDiscussionFamilyMember } from './entities/case-discussion-family-member.entity';

describe('Case discussions country access', () => {
  const actor = Object.assign(new User(), {
    id: 99,
    countryId: 3,
    role: { name: Role.ADMIN_COUNTRY },
  });

  const makeService = (countryId?: number) => {
    const entity = Object.assign(new Case(), {
      id: 41,
      participant: { id: 12, countryId },
    });
    const discussion = Object.assign(new CaseDiscussion(), {
      id: 1,
      caseId: 41,
      case: entity,
    });
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[discussion], 1]),
    };
    const discussions = {
      findOne: jest.fn().mockResolvedValue(discussion),
      createQueryBuilder: jest.fn().mockReturnValue(query),
    };
    return new CaseDiscussionsService(
      discussions as unknown as Repository<CaseDiscussion>,
      {} as Repository<CaseDiscussionFamilyMember>,
      {
        findOne: jest.fn().mockResolvedValue(entity),
      } as unknown as Repository<Case>,
      {} as Repository<Participant>,
      {} as Repository<User>,
      {} as Repository<FamilyMember>,
      {} as CaseDiscussionsPdfService,
      {} as DataSource,
      {} as CaseDocumentHistoryService,
    );
  };

  it.each([1, undefined])(
    'denies foreign or unassigned discussions (%s) on every operation',
    async (countryId) => {
      const service = makeService(countryId);
      await expect(service.findAll(41, {}, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(service.findOne(41, 1, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(
        service.create(
          41,
          {
            participantId: 12,
            supervisorId: 99,
            discussionDate: '2026-10-19',
            presentedSituations: 'Test',
          },
          actor,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(service.update(41, 1, {}, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(
        service.finalize(
          41,
          1,
          {
            socialWorkerRecommendations: 'Test',
            supervisorRecommendations: 'Test',
          },
          actor,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.annul(41, 1, { reason: 'Test' }, actor),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );

  it('allows the country administrator to read discussions in their country', async () => {
    const service = makeService(3);
    await expect(service.findOne(41, 1, actor)).resolves.toMatchObject({
      id: 1,
    });
    await expect(service.findAll(41, {}, actor)).resolves.toMatchObject({
      total: 1,
    });
  });
});
