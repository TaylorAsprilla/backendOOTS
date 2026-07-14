import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Patch,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  AuthResponseDto,
  RegisterDto,
  UserProfileDto,
  LoginDto,
  RegisterResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar disponibilidad de email' })
  @ApiResponse({
    status: 200,
    description: 'Indica si el email está disponible para registro',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
      },
    },
  })
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ available: boolean }> {
    return await this.authService.checkEmailAvailability(email);
  }

  @Public()
  @Get('check-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar disponibilidad de número telefónico' })
  @ApiResponse({
    status: 200,
    description: 'Indica si el número telefónico está disponible para registro',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
      },
    },
  })
  async checkPhone(
    @Query('phoneNumber') phoneNumber: string,
  ): Promise<{ available: boolean }> {
    return await this.authService.checkPhoneNumberAvailability(phoneNumber);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de entrada',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  login(@CurrentUser() user: User, @Req() request: Request) {
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      request.ip ||
      '0.0.0.0';

    const userAgent = request.get('user-agent') ?? '';

    // Full session flow: tokens + session + history + geo alert
    return this.authService.loginWithSession(
      user,
      ipAddress as string,
      userAgent,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async getProfile(@CurrentUser() user: User): Promise<UserProfileDto> {
    const userProfile = await this.authService.getProfile(user.id);
    return userProfile.toResponseObject();
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        user: { $ref: '#/components/schemas/UserProfileDto' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  validateToken(@CurrentUser() user: User) {
    const response = {
      valid: true,
      user: user.toResponseObject(),
    };

    this.logger.log(`[auth-validate] response=${JSON.stringify(response)}`);

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Contraseña actualizada exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Las contraseñas no coinciden o la nueva contraseña es igual a la actual',
  })
  @ApiResponse({
    status: 401,
    description: 'La contraseña actual es incorrecta o token inválido',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.changePassword(user.id, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Instrucciones enviadas si el correo está registrado',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de entrada o al enviar el correo',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Contraseña restablecida exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Token inválido/expirado, contraseñas no coinciden o la nueva contraseña es igual a la anterior',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El email o teléfono ya está registrado por otro usuario',
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const updatedUser = await this.authService.updateProfile(
      user.id,
      updateProfileDto,
    );
    return updatedUser.toResponseObject();
  }

  // ─────────────────────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────────────────────

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar access token',
    description:
      'Intercambia un refresh token válido por un nuevo access token y un nuevo refresh token (rotación). ' +
      'El refresh token antiguo queda revocado inmediatamente.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        access_token: 'eyJhbGc...',
        refresh_token: 'uuid-uuid',
        expires_in: 3600,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refreshToken(
    @Body('refresh_token') refreshToken: string,
    @Req() request: Request,
  ) {
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      '0.0.0.0';
    const userAgent = request.headers['user-agent'] ?? '';
    return this.authService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent,
    );
  }

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Revoca la sesión activa y el refresh token del usuario.',
  })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Sesión cerrada correctamente' } },
  })
  async logout(
    @CurrentUser() user: User,
    @Body('refresh_token') refreshToken?: string,
  ) {
    return this.authService.logout(user.id, refreshToken);
  }

  // ─────────────────────────────────────────────────────────────
  // SESSIONS
  // ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Ver sesiones activas del usuario',
    description: 'Retorna las sesiones activas del usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de sesiones activas' })
  getSessions(@CurrentUser() user: User) {
    return this.authService.getSessions(user.id);
  }

  // ─────────────────────────────────────────────────────────────
  // LOGIN HISTORY
  // ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Historial de inicios de sesión',
    description:
      'Retorna el historial paginado de accesos del usuario con geolocalización y nivel de riesgo.',
  })
  @ApiResponse({ status: 200, description: 'Historial de accesos' })
  getLoginHistory(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.authService.getLoginHistory(user.id, page, limit);
  }
}
