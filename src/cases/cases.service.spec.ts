import { ForbiddenException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CaseStatus } from '../common/enums';
import { Participant } from '../participants/entities/participant.entity';
import { Case } from '../participants/entities/case.entity';
import { CasesService } from './cases.service';
import { UpdateCaseDto, UpdateCaseStatusDto } from './dto/case.dto';

describe('CasesService edit access control', () => {
  const makeService = (caseEntity: Case) => {
    const caseRepository = {
      update: jest.fn(),
      save: jest.fn((entity: Case) => Promise.resolve(entity)),
    } as unknown as Repository<Case>;
    const service = new CasesService(
      caseRepository,
      {} as Repository<Participant>,
      {} as DataSource,
    );
    jest.spyOn(service, 'findOne').mockResolvedValue(caseEntity);

    return { service, caseRepository };
  };

  it('allows only the case creator to update the case details', async () => {
    const caseEntity = { id: 4, createdById: 7 } as Case;
    const { service } = makeService(caseEntity);

    await expect(service.updateCase(4, {} as UpdateCaseDto, 7)).resolves.toBe(
      caseEntity,
    );
    await expect(
      service.updateCase(4, {} as UpdateCaseDto, 8),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows only the case creator to change its status', async () => {
    const caseEntity = {
      id: 4,
      createdById: 7,
      status: CaseStatus.OPEN,
    } as Case;
    const { service, caseRepository } = makeService(caseEntity);

    await expect(
      service.updateStatus(
        4,
        { status: CaseStatus.IN_PROGRESS } as UpdateCaseStatusDto,
        7,
      ),
    ).resolves.toBe(caseEntity);
    await expect(
      service.updateStatus(
        4,
        { status: CaseStatus.CLOSED } as UpdateCaseStatusDto,
        8,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(caseRepository.save.mock.calls).toHaveLength(1);
  });
});
