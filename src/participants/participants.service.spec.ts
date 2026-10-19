import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { Participant } from './entities/participant.entity';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ParticipantsService } from './participants.service';
import {
  ParticipantAuditAction,
  ParticipantAuditLog,
} from '../audit/entities/participant-audit-log.entity';

describe('ParticipantsService access control and auditing', () => {
  it.each([
    ['user', { registeredById: 7 }],
    ['country', { countryId: 7 }],
  ])('keeps the %s scope while returning table counts and safe relation summaries', async (scope, where) => {
    const rows = [{
      id: 12, firstName: 'Ana', firstLastName: 'Perez', casesCount: 2,
      country: { iso: 'CO', internal: 'not returned' },
      registeredBy: { id: 7, firstName: 'Sara', firstLastName: 'Diaz', email: 'sara@example.test', password: 'not returned' },
    }, { id: 13, casesCount: 0, country: null, registeredBy: null }];
    const query = {
      setFindOptions: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    };
    const repository = { createQueryBuilder: jest.fn().mockReturnValue(query) } as unknown as Repository<Participant>;
    const service = new ParticipantsService(repository);
    const result = scope === 'user' ? await service.findByUser(7) : await service.findByCountry(7);
    expect(query.setFindOptions).toHaveBeenCalledWith(expect.objectContaining({ where }));
    expect(query.loadRelationCountAndMap).toHaveBeenCalledWith('participant.casesCount', 'participant.cases');
    expect(result.participants[0]).toMatchObject({
      casesCount: 2, fullName: 'Ana Perez', country: { iso: 'CO' },
      registeredBy: { id: 7, email: 'sara@example.test' },
    });
    expect(result.participants[0].registeredBy).not.toHaveProperty('password');
    expect(result.participants[1]).toMatchObject({ casesCount: 0, registeredBy: null, country: null });
  });

  it('includes case counts in the global list without loading clinical case data', async () => {
    const participants = [{ id: 12, casesCount: 3 }];
    const query = {
      setFindOptions: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(participants),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
    } as unknown as Repository<Participant>;
    const result = await new ParticipantsService(repository).findAllNoPagination();
    expect(query.setFindOptions).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    expect(query.loadRelationCountAndMap).toHaveBeenCalledWith('participant.casesCount', 'participant.cases');
    expect(result).toEqual({ data: participants, total: 1 });
  });

  const participant = {
    id: 12,
    registeredById: 7,
    countryId: 3,
  } as Participant;

  const makeUser = (id: number, role: Role, countryId?: number): User =>
    ({
      id,
      role: { name: role },
      countryId,
      email: 'actor@example.test',
      firstName: 'Nombre',
      firstLastName: 'Apellido',
    }) as User;

  const makeService = () => {
    const save = jest.fn((entity: object) => Promise.resolve(entity));
    const create = jest.fn((entity: unknown, data: object) =>
      entity === Participant ? { id: 12, ...data } : data,
    );
    const softDelete = jest.fn(() => Promise.resolve({ affected: 1 }));
    const findOne = jest.fn(() =>
      Promise.resolve<Participant | null>(participant),
    );
    const entityManager = {
      save,
      create,
      softDelete,
      findOne,
    } as unknown as EntityManager;
    const repository = {
      manager: {
        transaction: jest.fn(
          (callback: (manager: EntityManager) => Promise<unknown>) =>
            callback(entityManager),
        ),
      },
    } as unknown as Repository<Participant>;
    const service = new ParticipantsService(repository);
    jest.spyOn(service, 'findOne').mockResolvedValue(participant);

    return { service, save, create, softDelete, findOne };
  };

  it('attributes creation and its audit to the authenticated user, not the body', async () => {
    const { service, create } = makeService();

    await service.create(
      {
        firstName: 'Ana',
        firstLastName: 'Perez',
        registeredById: 99,
      } as CreateParticipantDto,
      makeUser(7, Role.TRABAJO_SOCIAL),
    );

    expect(create).toHaveBeenCalledWith(
      Participant,
      expect.objectContaining({ registeredById: 7 }),
    );
    expect(create).toHaveBeenCalledWith(
      ParticipantAuditLog,
      expect.objectContaining({
        participantId: 12,
        userId: 7,
        userEmail: 'actor@example.test',
        userName: 'Nombre Apellido',
        action: ParticipantAuditAction.CREATE,
      }),
    );
  });

  it('allows ADMIN to edit any participant', async () => {
    const { service, save } = makeService();

    await expect(
      service.update(
        12,
        { firstName: 'Ana' } as UpdateParticipantDto,
        makeUser(99, Role.ADMIN),
      ),
    ).resolves.toBe(participant);

    expect(save.mock.calls[0]).toEqual([participant]);
    expect(save.mock.calls[1]).toEqual([
      expect.objectContaining({
        participantId: 12,
        userId: 99,
        userEmail: 'actor@example.test',
        userName: 'Nombre Apellido',
        action: ParticipantAuditAction.UPDATE,
      }),
    ]);
  });

  it('clears optional names when the update explicitly sends null', async () => {
    const { service, save } = makeService();

    await service.update(
      12,
      { secondName: null, secondLastName: null },
      makeUser(99, Role.ADMIN),
    );

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        secondName: null,
        secondLastName: null,
      }),
    );
  });

  it('allows ADMIN_COUNTRY to edit participants in their assigned country', async () => {
    const { service } = makeService();

    await expect(
      service.update(
        12,
        { firstName: 'Ana' } as UpdateParticipantDto,
        makeUser(99, Role.ADMIN_COUNTRY, 3),
      ),
    ).resolves.toBe(participant);
  });

  it('denies ADMIN_COUNTRY access to participants from another country', async () => {
    const { service } = makeService();

    await expect(
      service.update(
        12,
        { firstName: 'Ana' } as UpdateParticipantDto,
        makeUser(99, Role.ADMIN_COUNTRY, 4),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows TRABAJO_SOCIAL to edit participants they registered', async () => {
    const { service } = makeService();

    await expect(
      service.update(
        12,
        { firstName: 'Ana' } as UpdateParticipantDto,
        makeUser(7, Role.TRABAJO_SOCIAL),
      ),
    ).resolves.toBe(participant);
  });

  it('denies TRABAJO_SOCIAL access to participants registered by another user', async () => {
    const { service, save } = makeService();

    await expect(
      service.update(
        12,
        { firstName: 'Ana' } as UpdateParticipantDto,
        makeUser(8, Role.TRABAJO_SOCIAL),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(save).not.toHaveBeenCalled();
  });

  it('records the authenticated actor when deleting a participant', async () => {
    const { service, save, create, softDelete } = makeService();

    await service.remove(12, makeUser(7, Role.TRABAJO_SOCIAL));

    expect(softDelete).toHaveBeenCalledWith(Participant, 12);
    expect(create).toHaveBeenCalledWith(ParticipantAuditLog, {
      participantId: 12,
      userId: 7,
      userEmail: 'actor@example.test',
      userName: 'Nombre Apellido',
      action: ParticipantAuditAction.DELETE,
      createdAt: expect.any(Date),
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('propagates audit failures so the transaction cannot commit', async () => {
    const { service, save } = makeService();
    save.mockResolvedValueOnce(participant);
    save.mockRejectedValueOnce(new Error('Audit unavailable'));

    await expect(
      service.update(
        12,
        { firstName: 'Ana' },
        makeUser(7, Role.TRABAJO_SOCIAL),
      ),
    ).rejects.toThrow('Audit unavailable');
  });

  it('does not delete or audit a nonexistent participant', async () => {
    const { service, findOne, save, softDelete } = makeService();
    findOne.mockResolvedValueOnce(null);

    await expect(
      service.remove(12, makeUser(7, Role.TRABAJO_SOCIAL)),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(save).not.toHaveBeenCalled();
    expect(softDelete).not.toHaveBeenCalled();
  });

  it('does not audit a failed deletion', async () => {
    const { service, save, softDelete } = makeService();
    softDelete.mockRejectedValueOnce(new Error('Delete unavailable'));

    await expect(
      service.remove(12, makeUser(7, Role.TRABAJO_SOCIAL)),
    ).rejects.toThrow('Delete unavailable');

    expect(save).not.toHaveBeenCalled();
  });
});
