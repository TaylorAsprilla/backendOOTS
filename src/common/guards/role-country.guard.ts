import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

/**
 * Permite acceso a:
 * - ADMIN: todo
 * - ADMIN_COUNTRY: solo datos de su país
 * - USER: solo datos asignados a él
 *
 * Uso: @UseGuards(RoleCountryGuard)
 */
@Injectable()
export class RoleCountryGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('No autenticado');

    // ADMIN ve todo
    if (user.role?.name === Role.ADMIN) return true;

    // ADMIN_COUNTRY solo accede a su país
    if (user.role?.name === Role.ADMIN_COUNTRY) {
      // Si hay parámetro countryId, debe coincidir
      const countryId = this.extractCountryId(request);
      if (countryId && Number(user.countryId) !== Number(countryId)) {
        throw new ForbiddenException('Solo puede acceder a datos de su país');
      }
      return true;
    }

    // USER solo accede a lo asignado a él
    if (user.role?.name === Role.USER) {
      const userId = this.extractUserId(request);
      if (userId && Number(user.id) !== Number(userId)) {
        throw new ForbiddenException('Solo puede acceder a sus propios datos');
      }
      return true;
    }

    // Otros roles: acceso denegado por defecto
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
   * Extrae userId de params, query o body
   */
  private extractUserId(request: any): number | undefined {
    return (
      request.params?.userId || request.query?.userId || request.body?.userId
    );
  }
}
