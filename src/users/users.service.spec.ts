import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { MailService } from '../mail/mail.service';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService country access', () => {
  const actor = Object.assign(new User(), {
    id: 99,
    countryId: 3,
    role: { name: Role.ADMIN_COUNTRY },
  });
  const makeService = (countryId?: number) => {
    const user = Object.assign(new User(), {
      id: 7,
      countryId,
      roleId: 4,
      password: 'not-returned',
    });
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn().mockResolvedValue({
        entities: [user],
        raw: [{ participantCount: '2', caseCount: '3' }],
      }),
    };
    const repository = {
      findOne: jest.fn().mockResolvedValue(user),
      find: jest.fn().mockResolvedValue([user]),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(query),
    };
    const service = new UsersService(
      repository as unknown as Repository<User>,
      {} as MailService,
    );
    return { service, repository, query };
  };

  it('filters active and deleted-user lists by the authenticated country', async () => {
    const { service, query, repository } = makeService(3);
    const users = await service.findAll(actor);
    expect(query.andWhere).toHaveBeenCalledWith('user.countryId = :countryId', {
      countryId: 3,
    });
    expect(users[0]).not.toHaveProperty('password');
    await service.findAllWithDeleted(actor);
    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { countryId: 3 } }),
    );
  });

  it.each([1, undefined])(
    'denies foreign or unassigned users (%s) for detail and mutations',
    async (countryId) => {
      const { service, repository } = makeService(countryId);
      await expect(service.findOne(7, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(service.update(7, {}, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(service.remove(7, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(service.restore(7, actor)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    },
  );

  it('allows same-country detail without credentials and preserves global ADMIN access', async () => {
    const { service } = makeService(3);
    await expect(service.findOne(7, actor)).resolves.toMatchObject({
      id: 7,
      countryId: 3,
    });
    const globalAdmin = Object.assign(new User(), {
      role: { name: Role.ADMIN },
    });
    await expect(
      makeService(1).service.findOne(7, globalAdmin),
    ).resolves.toMatchObject({ countryId: 1 });
  });

  it('keeps user management read-only for country administrators', async () => {
    const { service, repository } = makeService(3);
    await expect(
      service.update(7, { countryId: 1 }, actor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(7, { roleId: 1 }, actor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(7, { password: 'not-applied' }, actor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.remove(7, actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.restore(7, actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not disclose foreign users through document or MITA checks', async () => {
    const { service, repository } = makeService(3);
    repository.findOne.mockResolvedValue(null);
    await service.checkDocumentNumber('12345', actor);
    expect(repository.findOne).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          documentNumber: '12345',
          countryId: 3,
        }),
      }),
    );
    await service.checkMitaNumber(57, actor);
    expect(repository.findOne).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ mitaNumber: 57, countryId: 3 }),
      }),
    );
  });
});
