import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  private buildAccessLog(context: ExecutionContext, user?: any): string {
    const request = context.switchToHttp().getRequest();
    return [
      `method=${request.method}`,
      `path=${request.originalUrl ?? request.url}`,
      `userId=${user?.id ?? 'undefined'}`,
      `email=${user?.email ?? 'undefined'}`,
      `roleId=${user?.role?.id ?? user?.roleId ?? 'undefined'}`,
      `roleName=${user?.role?.name ?? 'undefined'}`,
    ].join(' ');
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      this.logger.warn(
        `[roles-guard] denied because request.user is empty ${this.buildAccessLog(context)}`,
      );
      throw new ForbiddenException('Acceso denegado');
    }

    const hasRole = requiredRoles.some((role) => user.role?.name === role);

    this.logger.log(
      `[roles-guard] evaluating roles ${this.buildAccessLog(context, user)} requiredRoles=${requiredRoles.join(',')}`,
    );

    if (!hasRole) {
      this.logger.warn(
        `[roles-guard] denied because role does not match ${this.buildAccessLog(context, user)} requiredRoles=${requiredRoles.join(',')}`,
      );

      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
