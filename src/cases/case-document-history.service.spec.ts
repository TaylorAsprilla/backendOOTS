import { ConflictException, ForbiddenException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CaseStatus, Role } from '../common/enums';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import {
  CaseDocumentHistoryService,
  ageAt,
  historicalUser,
} from './case-document-history.service';
import { CaseDocumentHistory } from './entities/case-document-history.entity';

describe('CaseDocumentHistoryService', () => {
  const service = new CaseDocumentHistoryService({} as DataSource);
  const entity = { id: 1, createdById: 7 } as Case;
  const user = (role: Role, id = 7, countryId = 1) =>
    Object.assign(new User(), { id, countryId, role: { name: role } });

  it.each([
    [Role.ADMIN, 99, 9],
    [Role.ADMIN_COUNTRY, 99, 1],
    [Role.TRABAJO_SOCIAL, 7, 9],
  ])('allows %s only within its download scope', (role, id, country) => {
    expect(() =>
      service.assertCanDownload(entity, 1, user(role, id, country)),
    ).not.toThrow();
  });

  it.each([
    [Role.ADMIN_COUNTRY, 99, 2],
    [Role.TRABAJO_SOCIAL, 8, 1],
    [Role.USER, 7, 1],
    [Role.SUPERVISOR, 7, 1],
  ])('denies unauthorized %s downloads', (role, id, country) => {
    expect(() =>
      service.assertCanDownload(entity, 1, user(role, id, country)),
    ).toThrow(ForbiddenException);
  });

  it('never treats a missing country or creator as an authorization match', () => {
    expect(() =>
      service.assertCanDownload(entity, undefined, user(Role.ADMIN_COUNTRY)),
    ).toThrow(ForbiddenException);
    expect(() =>
      service.assertCanDownload({} as Case, 1, user(Role.TRABAJO_SOCIAL)),
    ).toThrow(ForbiddenException);
  });

  it('preserves age at the reference date rather than the download date', () => {
    expect(ageAt('1991-10-15', new Date('2026-10-15T00:00:00Z'))).toBe(35);
    expect(ageAt('1991-10-16', new Date('2026-10-15T00:00:00Z'))).toBe(34);
  });

  it('does not copy credentials or tokens into historical professional identity', () => {
    const snapshot = historicalUser(
      Object.assign(user(Role.ADMIN), {
        firstName: 'Original',
        password: 'not-for-documents',
        passwordResetToken: 'secret',
      }),
    );
    expect(snapshot).toMatchObject({ id: 7, firstName: 'Original' });
    expect(snapshot?.password).toBeUndefined();
    expect(snapshot?.passwordResetToken).toBeUndefined();
    expect(snapshot?.role).toBeUndefined();
    expect(JSON.stringify(snapshot)).not.toContain('password');
  });

  it('rejects edits to a closed case', () => {
    expect(() =>
      service.assertOpen({ status: CaseStatus.CLOSED } as Case),
    ).toThrow(ConflictException);
  });

  it('authorizes before loading a clinical snapshot', async () => {
    const findOneBy = jest.fn();
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce({ countryId: 1 }),
      findOneBy,
    } as unknown as EntityManager;
    const source = {
      transaction: jest.fn(
        (
          _level: string,
          callback: (manager: EntityManager) => Promise<unknown>,
        ) => callback(manager),
      ),
    } as unknown as DataSource;
    const history = new CaseDocumentHistoryService(source);
    await expect(
      history.getDocumentCase(1, user(Role.TRABAJO_SOCIAL, 8)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(findOneBy).not.toHaveBeenCalled();
  });

  it('serves a closed case exclusively from persisted snapshots', async () => {
    const frozen = { id: 1, consultationReason: 'Original' } as Case;
    const persisted = Object.assign(new CaseDocumentHistory(), {
      closedSnapshot: frozen,
      discussionsSnapshot: [],
    });
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ ...entity, status: CaseStatus.CLOSED })
        .mockResolvedValueOnce({ countryId: 1 }),
      findOneBy: jest.fn().mockResolvedValue(persisted),
    } as unknown as EntityManager;
    const source = {
      transaction: jest.fn(
        (
          _level: string,
          callback: (manager: EntityManager) => Promise<unknown>,
        ) => callback(manager),
      ),
    } as unknown as DataSource;
    const history = new CaseDocumentHistoryService(source);
    const loadCase = jest.spyOn(history, 'loadCase');
    await expect(history.getDocumentCase(1, user(Role.ADMIN))).resolves.toBe(
      frozen,
    );
    expect(loadCase).not.toHaveBeenCalled();
  });
});
