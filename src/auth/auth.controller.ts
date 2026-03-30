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
  login(@CurrentUser() user: User, @Req() request: Request): AuthResponseDto {
    // El usuario ya viene validado por LocalAuthGuard
    // Capturar la IP del cliente
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.socket.remoteAddress ||
      request.ip ||
      '0.0.0.0';

    // Guardar geolocalización de forma asíncrona (no bloquea la respuesta)
    this.authService
      .saveLoginGeolocation(user.id, ipAddress as string)
      .catch((error) => {
        console.error('Error guardando geolocalización:', error);
      });

    return this.authService.generateAuthResponse(user);
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
    return {
      valid: true,
      user: user.toResponseObject(),
    };
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
}
