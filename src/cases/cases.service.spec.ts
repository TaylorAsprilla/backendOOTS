import { ConflictException, ForbiddenException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CaseStatus } from '../common/enums';
import { Participant } from '../participants/entities/participant.entity';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import { CasesService } from './cases.service';
import { CaseDocumentHistoryService } from './case-document-history.service';

describe('CasesService edit access control and closing', () => {
  it('keeps the user scope and supplies safe professional, participant and expandable details', async () => {
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{
        id: 36, createdById: 7, status: CaseStatus.OPEN, progressNotesCount: 2,
        participant: { id: 12, firstName: 'Ana', firstLastName: 'Perez', city: 'Bogota', country: { id: 1, name: 'Colombia' } },
        createdBy: { id: 7, firstName: 'Sara', firstLastName: 'Diaz', email: 'sara@example.test', password: 'not returned' },
        intervention: 'Intervention', closingNote: { observations: 'Summary' },
        followUpPlans: [{ orientationAppointment: true, appointmentDate: '2026-10-20', privateNote: 'not returned' }],
      }, { id: 37, participant: { id: 13 }, createdBy: null }]),
    };
    const repository = { createQueryBuilder: jest.fn().mockReturnValue(query) } as unknown as Repository<Case>;
    const service = new CasesService(
      repository, {} as Repository<Participant>, {} as DataSource, {} as CaseDocumentHistoryService,
    );
    const result = await service.findCasesByUser(7);
    expect(query.where).toHaveBeenCalledWith('case.createdById = :userId', { userId: 7 });
    expect(result.cases[0]).toMatchObject({
      id: 36, progressNotesCount: 2, closingNote: 'Summary',
      participant: { city: 'Bogota' },
      createdBy: { id: 7, email: 'sara@example.test' },
      followUpPlans: [{ orientationAppointment: true, appointmentDate: '2026-10-20' }],
    });
    expect(result.cases[0].createdBy).not.toHaveProperty('password');
    expect(result.cases[0].followUpPlans?.[0]).not.toHaveProperty('privateNote');
    expect(result.cases[1].createdBy).toBeNull();
  });

  const makeService = (caseEntity: Case) => {
    const update = jest.fn(
      (_target: unknown, _id: number, fields: Partial<Case>) => {
        Object.assign(caseEntity, fields);
        return Promise.resolve({ affected: 1 });
      },
    );
    const manager = {
      update,
      findOne: jest.fn().mockResolvedValue(caseEntity),
      findOneBy: jest.fn().mockResolvedValue({ id: 7 }),
    } as unknown as EntityManager;
    const dataSource = {
      transaction: jest.fn(
        (callback: (manager: EntityManager) => Promise<unknown>) =>
          callback(manager),
      ),
    } as unknown as DataSource;
    const history = new CaseDocumentHistoryService(dataSource);
    jest.spyOn(history, 'lockCase').mockResolvedValue(caseEntity);
    jest.spyOn(history, 'loadCase').mockResolvedValue(caseEntity);
    const freeze = jest.spyOn(history, 'freeze').mockResolvedValue();
    const service = new CasesService(
      {} as Repository<Case>,
      {} as Repository<Participant>,
      dataSource,
      history,
    );
    return { service, update, freeze };
  };

  it('allows only the case creator to update the case details', async () => {
    const entity = { id: 4, createdById: 7, status: CaseStatus.OPEN } as Case;
    const { service } = makeService(entity);
    await expect(service.updateCase(4, {}, 7)).resolves.toBe(entity);
    await expect(service.updateCase(4, {}, 8)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows only the case creator to change its status', async () => {
    const entity = { id: 4, createdById: 7, status: CaseStatus.OPEN } as Case;
    const { service, update, freeze } = makeService(entity);
    await service.updateStatus(4, { status: CaseStatus.IN_PROGRESS }, 7);
    await expect(
      service.updateStatus(4, { status: CaseStatus.CLOSED }, 8),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(update).toHaveBeenCalledTimes(1);
    expect(freeze).not.toHaveBeenCalled();
  });

  it('captures a closing snapshot inside the status transaction', async () => {
    const entity = { id: 4, createdById: 7, status: CaseStatus.OPEN } as Case;
    const { service, freeze } = makeService(entity);
    await service.updateStatus(4, { status: CaseStatus.CLOSED }, 7);
    expect(freeze).toHaveBeenCalledWith(expect.anything(), entity, {
      id: 7,
    } as User);
  });

  it('rejects edits and reopening after closing, even for the creator', async () => {
    const entity = { id: 4, createdById: 7, status: CaseStatus.CLOSED } as Case;
    const { service, update } = makeService(entity);
    await expect(
      service.updateCase(4, { consultationReason: 'Changed' }, 7),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.updateStatus(4, { status: CaseStatus.OPEN }, 7),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });
});
