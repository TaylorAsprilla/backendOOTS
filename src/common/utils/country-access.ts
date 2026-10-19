import { ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import type { User } from '../../users/entities/user.entity';

export function getAdminCountryId(user?: User): number | undefined {
  if (user?.role?.name !== Role.ADMIN_COUNTRY) return undefined;
  const countryId = Number(user.countryId);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw new ForbiddenException('El administrador no tiene un país asignado');
  }
  return countryId;
}

export function countryScope(user?: User): { countryId?: number } {
  const countryId = getAdminCountryId(user);
  return countryId === undefined ? {} : { countryId };
}

export function assertCountryAccess(
  user: User | undefined,
  countryId: number | null | undefined,
): void {
  const assignedCountryId = getAdminCountryId(user);
  if (
    assignedCountryId !== undefined &&
    Number(countryId) !== assignedCountryId
  ) {
    throw new ForbiddenException('Solo puede acceder a datos de su país');
  }
}
