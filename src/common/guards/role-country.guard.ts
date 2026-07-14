import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

export const SKIP_ROLE_COUNTRY_GUARD = 'skipRoleCountryGuard';

/**
 * Permite acceso a:
 * - ADMIN: todo
 * - ADMIN_COUNTRY: solo datos de su país
 * - TRABAJO_SOCIAL: solo datos de su país asignados a él
 * - USER: solo datos asignados a él
 *
 * Uso: @UseGuards(RoleCountryGuard)
 */
@Injectable()
export class RoleCountryGuard implements CanActivate {
  private readonly logger = new Logger(RoleCountryGuard.name);

  constructor(private readonly reflector: Reflector) {}

  private buildAccessLog(request: any, user?: any): string {
    return [
      `method=${request.method}`,
      `path=${request.originalUrl ?? request.url}`,
      `userId=${user?.id ?? 'undefined'}`,
      `email=${user?.email ?? 'undefined'}`,
      `roleId=${user?.role?.id ?? user?.roleId ?? 'undefined'}`,
      `roleName=${user?.role?.name ?? 'undefined'}`,
      `countryId=${user?.countryId ?? 'undefined'}`,
      `requestCountryId=${request.params?.countryId ?? request.query?.countryId ?? request.body?.countryId ?? 'undefined'}`,
      `requestRegisteredById=${request.params?.registeredById ?? request.query?.registeredById ?? request.body?.registeredById ?? 'undefined'}`,
      `requestUserId=${request.params?.userId ?? request.query?.userId ?? request.body?.userId ?? 'undefined'}`,
    ].join(' ');
  }

  canActivate(context: ExecutionContext): boolean {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_ROLE_COUNTRY_GUARD,
      [context.getHandler(), context.getClass()],
    );

    if (skipGuard) {
      const request = context.switchToHttp().getRequest();
      this.logger.log(
        `[role-country-guard] skipped by metadata method=${request.method} path=${request.originalUrl ?? request.url}`,
      );
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      this.logger.warn(
        `[role-country-guard] denied because request.user is empty ${this.buildAccessLog(request)}`,
      );
      throw new ForbiddenException('No autenticado');
    }

    this.logger.log(
      `[role-country-guard] evaluating ${this.buildAccessLog(request, user)}`,
    );

    // ADMIN ve todo
    if (user.role?.name === Role.ADMIN) return true;

    // ADMIN_COUNTRY solo accede a datos de su país
    if (user.role?.name === Role.ADMIN_COUNTRY) {
      // Si hay parámetro countryId, debe coincidir
      const countryId = this.extractCountryId(request);
      if (countryId && Number(user.countryId) !== Number(countryId)) {
        this.logger.warn(
          `[role-country-guard] denied for admin country mismatch ${this.buildAccessLog(request, user)}`,
        );
        throw new ForbiddenException('Solo puede acceder a datos de su país');
      }
      return true;
    }

    // TRABAJO_SOCIAL solo accede a datos de su país asignados a él
    if (user.role?.name === Role.TRABAJO_SOCIAL) {
      const countryId = this.extractCountryId(request);
      if (countryId && Number(user.countryId) !== Number(countryId)) {
        this.logger.warn(
          `[role-country-guard] denied for social work country mismatch ${this.buildAccessLog(request, user)}`,
        );
        throw new ForbiddenException('Solo puede acceder a datos de su país');
      }

      const assignedUserId = this.extractAssignedUserId(request);
      if (assignedUserId && Number(user.id) !== Number(assignedUserId)) {
        this.logger.warn(
          `[role-country-guard] denied for social work ownership mismatch ${this.buildAccessLog(request, user)}`,
        );
        throw new ForbiddenException(
          'Solo puede acceder a datos de su país asignados a usted',
        );
      }

      return true;
    }

    // USER solo accede a lo asignado a él
    if (user.role?.name === Role.USER) {
      const userId = this.extractUserId(request);
      if (userId && Number(user.id) !== Number(userId)) {
        this.logger.warn(
          `[role-country-guard] denied for user ownership mismatch ${this.buildAccessLog(request, user)}`,
        );
        throw new ForbiddenException('Solo puede acceder a sus propios datos');
      }
      return true;
    }

    // Otros roles: acceso denegado por defecto
    this.logger.warn(
      `[role-country-guard] denied because role is unsupported ${this.buildAccessLog(request, user)}`,
    );
    throw new ForbiddenException('Acceso denegado');
  }

  /**
   * Extrae countryId de params, query o body
   */
  private extractCountryId(request: any): number | undefined {
    return (
      request.params?.countryId ||
      request.query?.countryId ||
      request.body?.countryId
    );
  }

  /**
   * Extrae el usuario asignado desde params, query o body
   */
  private extractAssignedUserId(request: any): number | undefined {
    return (
      request.params?.registeredById ||
      request.query?.registeredById ||
      request.body?.registeredById ||
      this.extractUserId(request)
    );
  }

  /**
   * Extrae userId de params, query o body
   */
  private extractUserId(request: any): number | undefined {
    return (
      request.params?.userId || request.query?.userId || request.body?.userId
    );
  }
}
