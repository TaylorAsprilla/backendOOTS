import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CaseStatus, Role } from '../common/enums';
import { Participant } from '../participants/entities/participant.entity';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import { CasesService } from './cases.service';
import { CaseDocumentHistoryService } from './case-document-history.service';

describe('CasesService edit access control and closing', () => {
  const countryAdmin = Object.assign(new User(), {
    id: 99, countryId: 3, role: { name: Role.ADMIN_COUNTRY },
  });

  it('lists cases for the country across professionals and scopes user and global lists', async () => {
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 41, createdById: 7, participant: { id: 12, countryId: 3 } },
        { id: 42, createdById: 8, participant: { id: 13, countryId: 3 } },
      ]),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const service = new CasesService(
      { createQueryBuilder: jest.fn().mockReturnValue(query) } as unknown as Repository<Case>,
      {} as Repository<Participant>, {} as DataSource, {} as CaseDocumentHistoryService,
    );
    const result = await service.findCasesByCountry(3, countryAdmin);
    expect(result.cases.map((c) => c.createdById)).toEqual([7, 8]);
    expect(query.where).not.toHaveBeenCalled();
    await service.findCasesByUser(7, countryAdmin);
    expect(query.where).toHaveBeenCalledWith('case.createdById = :userId', { userId: 7 });
    await service.findAll(1, 50, countryAdmin);
    await service.findAllNoPagination(countryAdmin);
    expect(query.andWhere).toHaveBeenCalledTimes(4);
    expect(query.andWhere).toHaveBeenCalledWith('participant.countryId = :countryId', { countryId: 3 });
    await expect(service.findCasesByCountry(1, countryAdmin)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies foreign case details even when requested directly by ID', async () => {
    const entity = Object.assign(new Case(), { id: 41, participant: { countryId: 1 } });
    const service = new CasesService(
      { findOne: jest.fn().mockResolvedValue(entity) } as unknown as Repository<Case>,
      {} as Repository<Participant>, {} as DataSource, {} as CaseDocumentHistoryService,
    );
    await expect(service.findOne(41, countryAdmin)).rejects.toBeInstanceOf(ForbiddenException);
    entity.participant.countryId = 3;
    await expect(service.findOne(41, countryAdmin)).resolves.toBe(entity);
  });

  it('checks the participant country before listing their cases', async () => {
    const count = jest.fn().mockResolvedValue(1);
    const service = new CasesService(
      { find: jest.fn().mockResolvedValue([]) } as unknown as Repository<Case>,
      { count } as unknown as Repository<Participant>,
      {} as DataSource, {} as CaseDocumentHistoryService,
    );
    await service.findAllByParticipant(12, countryAdmin);
    expect(count).toHaveBeenCalledWith({ where: { id: 12, countryId: 3 } });
  });

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

  it('lets a country admin edit and change the status of cases created by others', async () => {
    const entity = { id: 4, createdById: 7, status: CaseStatus.OPEN } as Case;
    const { service, update } = makeService(entity);
    jest.spyOn(service, 'findOne').mockResolvedValue(entity);
    await expect(service.updateCase(4, {}, 99, countryAdmin)).resolves.toBe(
      entity,
    );
    await service.updateStatus(
      4,
      { status: CaseStatus.IN_PROGRESS },
      99,
      countryAdmin,
    );
    expect(update).toHaveBeenCalledTimes(1);
    // un usuario común que no creó el caso sigue sin poder editarlo
    await expect(service.updateCase(4, {}, 99)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  describe('case transfer by a country admin', () => {
    const makeTransfer = (caseCountryId: number, roleName: Role) => {
      const entity = Object.assign(new Case(), {
        id: 4,
        createdById: 7,
        assignedToId: 7,
        status: CaseStatus.OPEN,
        participant: { countryId: caseCountryId },
      });
      const toUser = { id: 50, countryId: 1, role: { name: roleName } };
      const save = jest.fn();
      const update = jest.fn();
      const manager = {
        create: jest.fn((_target: unknown, values: unknown) => values),
        save,
        update,
      } as unknown as EntityManager;
      const dataSource = {
        getRepository: jest
          .fn()
          .mockReturnValue({ findOne: jest.fn().mockResolvedValue(toUser) }),
        transaction: jest.fn(
          (callback: (manager: EntityManager) => Promise<unknown>) =>
            callback(manager),
        ),
      } as unknown as DataSource;
      const history = new CaseDocumentHistoryService(dataSource);
      jest.spyOn(history, 'lockCase').mockResolvedValue(entity);
      jest.spyOn(history, 'assertOpen').mockImplementation(() => undefined);
      const service = new CasesService(
        {
          findOne: jest.fn().mockResolvedValue(entity),
        } as unknown as Repository<Case>,
        {} as Repository<Participant>,
        dataSource,
        history,
      );
      return { service, save, update };
    };

    it('transfers a case of its country to a professional of another country', async () => {
      const { service, save, update } = makeTransfer(3, Role.PSICOLOGO);
      await service.transferCase(
        4,
        { toProfessionalId: 50, reason: 'Traslado' },
        99,
        countryAdmin,
      );
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({ fromUserId: 7, toUserId: 50, transferredById: 99 }),
      );
      expect(update).toHaveBeenCalledWith(Case, 4, { assignedToId: 50 });
    });

    it('denies transferring a case of another country', async () => {
      const { service, save } = makeTransfer(1, Role.PSICOLOGO);
      await expect(
        service.transferCase(
          4,
          { toProfessionalId: 50, reason: 'Traslado' },
          99,
          countryAdmin,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });

    it('rejects destinations whose role cannot receive cases', async () => {
      const { service, save } = makeTransfer(3, Role.ADMIN);
      await expect(
        service.transferCase(
          4,
          { toProfessionalId: 50, reason: 'Traslado' },
          99,
          countryAdmin,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(save).not.toHaveBeenCalled();
    });
  });
});
