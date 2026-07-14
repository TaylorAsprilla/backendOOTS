import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(
        `[jwt-auth-guard] authentication failed error=${err?.message ?? 'none'} info=${info?.message ?? 'none'}`,
      );
      throw err || new UnauthorizedException('Token inválido o expirado');
    }

    this.logger.log(
      `[jwt-auth-guard] authenticated userId=${user.id} email=${user.email ?? 'undefined'} roleId=${user.role?.id ?? user.roleId ?? 'undefined'} roleName=${user.role?.name ?? 'undefined'} countryId=${user.countryId ?? 'undefined'}`,
    );

    return user;
  }
}
