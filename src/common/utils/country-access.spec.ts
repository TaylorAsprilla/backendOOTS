import { ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { User } from '../../users/entities/user.entity';
import {
  assertCountryAccess,
  countryScope,
  getAdminCountryId,
} from './country-access';

describe('Country access for ADMIN_COUNTRY', () => {
  const user = (countryId?: number, role = Role.ADMIN_COUNTRY) =>
    Object.assign(new User(), { id: 10, countryId, role: { name: role } });

  it('derives scope from the authenticated user', () => {
    expect(getAdminCountryId(user(3))).toBe(3);
    expect(countryScope(user(3))).toEqual({ countryId: 3 });
    expect(() => assertCountryAccess(user(3), 3)).not.toThrow();
  });

  it.each([undefined, 0, -1, NaN])(
    'fails closed for invalid assigned country %s',
    (countryId) => {
      expect(() => countryScope(user(countryId))).toThrow(ForbiddenException);
    },
  );

  it.each([1, 2, null, undefined])(
    'denies a foreign or unassigned record country %s',
    (countryId) => {
      expect(() => assertCountryAccess(user(3), countryId)).toThrow(
        ForbiddenException,
      );
    },
  );

  it.each([Role.ADMIN, Role.TRABAJO_SOCIAL, Role.USER, Role.SUPERVISOR])(
    'preserves existing permissions for %s',
    (role) => {
      expect(countryScope(user(undefined, role))).toEqual({});
      expect(() => assertCountryAccess(user(3, role), 1)).not.toThrow();
    },
  );
});
