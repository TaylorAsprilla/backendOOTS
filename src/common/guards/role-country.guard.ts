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

  canActivate(context: ExecutionContext): boolean {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_ROLE_COUNTRY_GUARD,
      [context.getHandler(), context.getClass()],
    );

    if (skipGuard) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('No autenticado');

    const authSnapshot = {
      method: request.method,
      path: request.originalUrl ?? request.url,
      userId: user.id,
      email: user.email,
      role: user.role,
      roleName: user.role?.name,
      countryId: user.countryId,
    };

    // ADMIN ve todo
    if (user.role?.name === Role.ADMIN) return true;

    // ADMIN_COUNTRY solo accede a datos de su país
    if (user.role?.name === Role.ADMIN_COUNTRY) {
      // Si hay parámetro countryId, debe coincidir
      const countryId = this.extractCountryId(request);
      if (countryId && Number(user.countryId) !== Number(countryId)) {
        this.logger.warn({
          message: 'Country access denied',
          ...authSnapshot,
          requestCountryId: countryId,
        });
        throw new ForbiddenException('Solo puede acceder a datos de su país');
      }
      return true;
    }

    // TRABAJO_SOCIAL solo accede a datos de su país asignados a él
    if (user.role?.name === Role.TRABAJO_SOCIAL) {
      const countryId = this.extractCountryId(request);
      if (countryId && Number(user.countryId) !== Number(countryId)) {
        this.logger.warn({
          message: 'Country access denied for social work role',
          ...authSnapshot,
          requestCountryId: countryId,
        });
        throw new ForbiddenException('Solo puede acceder a datos de su país');
      }

      const assignedUserId = this.extractAssignedUserId(request);
      if (assignedUserId && Number(user.id) !== Number(assignedUserId)) {
        this.logger.warn({
          message: 'Assigned user access denied for social work role',
          ...authSnapshot,
          assignedUserId,
        });
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
        this.logger.warn({
          message: 'User ownership access denied',
          ...authSnapshot,
          requestUserId: userId,
        });
        throw new ForbiddenException('Solo puede acceder a sus propios datos');
      }
      return true;
    }

    // Otros roles: acceso denegado por defecto
    this.logger.warn({
      message: 'RoleCountryGuard denied access due to unsupported role',
      ...authSnapshot,
    });
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
