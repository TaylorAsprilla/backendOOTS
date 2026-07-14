import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      const user = await this.authService.validateUser(payload);

      this.logger.log(
        `[jwt-strategy] validated token sub=${payload.sub} email=${payload.email} jwtRole=${payload.role} userId=${user.id} userRole=${user.role?.name ?? 'undefined'} countryId=${user.countryId ?? 'undefined'}`,
      );

      if (payload.role !== user.role?.name) {
        this.logger.warn(
          `[jwt-strategy] jwt role mismatch userId=${user.id} email=${user.email} jwtRole=${payload.role} userRole=${user.role?.name ?? 'undefined'}`,
        );
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
