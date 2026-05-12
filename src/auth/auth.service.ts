import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Session } from './entities/session.entity';
import { LoginHistory, LoginRisk } from './entities/login-history.entity';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto';
import { UserStatus } from '../common/enums';
import { MailService } from '../mail/mail.service';
import { GeolocationService } from '../geolocation/geolocation.service';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  firstLastName: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    phoneNumber?: string;
    position?: string;
    headquarters?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    phoneNumber?: string;
    position?: string;
    headquarters?: string;
    role?: {
      id: number;
      name: string;
      description?: string;
    };
    country?: { id: number; name: string; iso?: string; locale?: string };
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Refresh token expiry: 7 days
  private readonly REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly geolocationService: GeolocationService,
  ) {}

  private buildAuthUser(user: User): AuthResponse['user'] {
    const base = user.toResponseObject();
    return {
      id: base.id,
      email: base.email,
      firstName: base.firstName,
      secondName: base.secondName,
      firstLastName: base.firstLastName,
      secondLastName: base.secondLastName,
      phoneNumber: base.phoneNumber,
      position: base.position,
      headquarters: base.headquarters,
      status: base.status,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      ...(user.role && {
        role: {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
        },
      }),
      ...(user.country && {
        country: {
          id: user.country.id,
          name: user.country.name,
          iso: user.country.iso,
          locale: user.country.locale,
        },
      }),
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException('Ya existe un usuario con este email');
      }

      // Verificar si ya existe un usuario con el mismo número de teléfono
      if (registerDto.phoneNumber) {
        const existingUserByPhone = await this.userRepository.findOne({
          where: { phoneNumber: registerDto.phoneNumber },
        });

        if (existingUserByPhone) {
          throw new ConflictException(
            'Ya existe un usuario con este número de teléfono',
          );
        }
      }

      // Crear el nuevo usuario directamente
      const plainPassword = registerDto.password ?? this.generatePassword();
      const newUser = this.userRepository.create({
        firstName: registerDto.firstName,
        secondName: registerDto.secondName,
        firstLastName: registerDto.firstLastName,
        secondLastName: registerDto.secondLastName,
        email: registerDto.email,
        password: plainPassword,
        phoneNumber: registerDto.phoneNumber,
        position: registerDto.position,
        headquarters: registerDto.headquarters,
        documentNumber: registerDto.documentNumber,
        address: registerDto.address,
        city: registerDto.city,
        birthDate: registerDto.birthDate
          ? new Date(registerDto.birthDate)
          : undefined,
        documentTypeId: registerDto.documentTypeId,
        roleId: registerDto.roleId,
        countryId: registerDto.countryId,
        mitaNumber: registerDto.mitaNumber,
        status: UserStatus.ACTIVE,
      });

      // Guardar el usuario en la base de datos
      const savedUser = await this.userRepository.save(newUser);

      // Enviar correo de bienvenida de forma asíncrona (no bloquea la respuesta)
      // Pasar la contraseña original (sin hashear) para mostrarla en el correo
      this.mailService
        .sendUserRegistrationEmail(savedUser, plainPassword)
        .catch((error) => {
          // Solo log del error, no afecta el registro del usuario
          console.error('Error enviando correo de bienvenida:', error);
        });

      // Retornar solo la información del usuario sin token
      return {
        message: 'Usuario registrado exitosamente',
        user: savedUser.toResponseObject(),
      };
    } catch (error) {
      // Si es un error de conflicto, lo re-lanzamos
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuario por email (solo usuarios activos)
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      firstLastName: user.firstLastName,
      role: user.role?.name ?? '',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      refresh_token: '',
      user: this.buildAuthUser(user),
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const { sub } = payload;
    const user = await this.userRepository.findOne({
      where: { id: sub, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  generateAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      firstLastName: user.firstLastName,
      role: user.role?.name ?? '',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      refresh_token: '',
      user: this.buildAuthUser(user),
    };
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });
  }

  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const existing = await this.userRepository.findOne({
      where: { email },
      select: ['id'],
    });
    return { available: !existing };
  }

  async checkPhoneNumberAvailability(
    phoneNumber: string,
  ): Promise<{ available: boolean }> {
    const existing = await this.userRepository.findOne({
      where: { phoneNumber },
      select: ['id'],
    });
    return { available: !existing };
  }

  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
      select: ['id', 'email', 'password', 'firstName', 'firstLastName'],
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['documentType'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async saveLoginGeolocation(userId: number, ipAddress: string): Promise<void> {
    try {
      await this.geolocationService.saveGeolocation(userId, ipAddress, 'login');
    } catch (error) {
      console.error(
        `Error guardando geolocalización para usuario ${userId}:`,
        error,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SESSION + SECURITY FEATURES
  // ─────────────────────────────────────────────────────────────

  /**
   * Full login flow: tokens, single session enforcement, login history + geo alerts.
   */
  async loginWithSession(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    console.log('Entrooooooooooooo');
    // 1. Generate access token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      firstLastName: user.firstLastName,
      role: user.role?.name ?? '',
    };
    const access_token = this.jwtService.sign(payload);
    const tokenHash = this.hashValue(access_token);

    // 2. Revoke all previous active sessions (single session enforcement)
    await this.sessionRepository.update(
      { userId: user.id, isActive: true },
      { isActive: false },
    );

    // 3. Revoke all existing refresh tokens
    await this.refreshTokenRepository.update(
      { userId: user.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    // 4. Generate and store new refresh token
    const rawRefreshToken = uuidv4() + '-' + uuidv4();
    const refreshTokenHash = this.hashValue(rawRefreshToken);
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_TTL_MS);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt,
        ipAddress,
        userAgent,
      }),
    );

    // 5. Detect device info
    const { deviceType, browser, os } = this.parseUserAgent(userAgent);

    // 6. Create new session
    await this.sessionRepository.save(
      this.sessionRepository.create({
        userId: user.id,
        tokenHash,
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        isActive: true,
        lastActivity: new Date(),
      }),
    );

    // 7. Geo + login history (non-blocking)
    this.recordLoginHistory(user, ipAddress, userAgent, {
      deviceType,
      browser,
      os,
    }).catch((err) => this.logger.error('Login history error', err));

    const response = {
      access_token,
      refresh_token: rawRefreshToken,
      user: this.buildAuthUser(user),
    };
    console.log('LOGIN RESPONSE:', response);
    return response;
  }

  /**
   * Exchange a valid refresh token for a new access token + rotated refresh token.
   */
  async refreshAccessToken(
    rawRefreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const hash = this.hashValue(rawRefreshToken);

    const stored = await this.refreshTokenRepository.findOne({
      where: { tokenHash: hash },
      relations: ['user', 'user.role'],
    });

    if (!stored || !stored.isValid) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    if (stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Rotate: revoke old token
    stored.revokedAt = new Date();
    await this.refreshTokenRepository.save(stored);

    // Issue new access token
    const user = stored.user;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      firstLastName: user.firstLastName,
      role: user.role?.name ?? '',
    };
    const access_token = this.jwtService.sign(payload);
    const newTokenHash = this.hashValue(access_token);

    // Update session token hash
    await this.sessionRepository.update(
      { userId: user.id, isActive: true },
      { tokenHash: newTokenHash, lastActivity: new Date() },
    );

    // Issue new refresh token
    const newRawRefresh = uuidv4() + '-' + uuidv4();
    const newRefreshHash = this.hashValue(newRawRefresh);
    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        tokenHash: newRefreshHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_TTL_MS),
        ipAddress,
        userAgent,
      }),
    );

    return { access_token, refresh_token: newRawRefresh, expires_in: 3600 };
  }

  /**
   * Invalidate session and revoke refresh token on logout.
   */
  async logout(
    userId: number,
    rawRefreshToken?: string,
  ): Promise<{ message: string }> {
    // Deactivate all sessions
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    // Revoke provided refresh token (or all of them)
    if (rawRefreshToken) {
      const hash = this.hashValue(rawRefreshToken);
      await this.refreshTokenRepository.update(
        { tokenHash: hash, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    } else {
      await this.refreshTokenRepository.update(
        { userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    }

    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Return active sessions for a user.
   */
  async getSessions(userId: number) {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'DESC' },
      select: [
        'id',
        'ipAddress',
        'deviceType',
        'browser',
        'os',
        'country',
        'city',
        'lastActivity',
        'createdAt',
      ],
    });
  }

  /**
   * Return paginated login history for a user.
   */
  async getLoginHistory(userId: number, page = 1, limit = 20) {
    const [data, total] = await this.loginHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private parseUserAgent(ua: string): {
    deviceType: string;
    browser: string;
    os: string;
  } {
    const lower = ua.toLowerCase();

    let deviceType = 'Desktop';
    if (/tablet|ipad/.test(lower)) deviceType = 'Tablet';
    else if (/mobile|android|iphone/.test(lower)) deviceType = 'Mobile';

    let browser = 'Unknown';
    if (/edg\//.test(lower)) browser = 'Edge';
    else if (/opr\/|opera/.test(lower)) browser = 'Opera';
    else if (/chrome/.test(lower)) browser = 'Chrome';
    else if (/firefox/.test(lower)) browser = 'Firefox';
    else if (/safari/.test(lower)) browser = 'Safari';

    let os = 'Unknown';
    if (/windows/.test(lower)) os = 'Windows';
    else if (/android/.test(lower)) os = 'Android';
    else if (/iphone|ipad|ios/.test(lower)) os = 'iOS';
    else if (/mac os/.test(lower)) os = 'macOS';
    else if (/linux/.test(lower)) os = 'Linux';

    return { deviceType, browser, os };
  }

  private async recordLoginHistory(
    user: User,
    ipAddress: string,
    userAgent: string,
    device: { deviceType: string; browser: string; os: string },
  ): Promise<void> {
    try {
      // Get geo data
      const geoData =
        await this.geolocationService.getGeolocationData(ipAddress);

      // Get last login to compare location
      const lastLogin = await this.loginHistoryRepository.findOne({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
      });

      let risk = LoginRisk.LOW;
      let isNewLocation = false;

      if (geoData && lastLogin) {
        if (geoData.country !== lastLogin.country) {
          risk = LoginRisk.HIGH;
          isNewLocation = true;
        } else if (geoData.city !== lastLogin.city) {
          risk = LoginRisk.MEDIUM;
          isNewLocation = true;
        }
      } else if (!lastLogin && geoData?.city) {
        // First login ever — not alarming, just record it
        isNewLocation = true;
      }

      // Save login history record
      await this.loginHistoryRepository.save(
        this.loginHistoryRepository.create({
          userId: user.id,
          ipAddress: geoData?.query ?? ipAddress,
          country: geoData?.country,
          countryCode: geoData?.countryCode,
          city: geoData?.city,
          region: geoData?.regionName,
          lat: geoData?.lat,
          lon: geoData?.lon,
          isp: geoData?.isp,
          timezone: geoData?.timezone,
          userAgent,
          deviceType: device.deviceType,
          browser: device.browser,
          os: device.os,
          isNewLocation,
          risk,
        }),
      );

      // Send security alert if new location (not first login)
      if (isNewLocation && lastLogin && risk !== LoginRisk.LOW) {
        this.mailService
          .sendSecurityAlertEmail(user, {
            ip: geoData?.query ?? ipAddress,
            city: geoData?.city,
            country: geoData?.country,
            device: device.deviceType,
            browser: device.browser,
            os: device.os,
            risk,
            date: new Date(),
          })
          .catch((err) => this.logger.error('Security alert email error', err));
      }
    } catch (error) {
      this.logger.error('recordLoginHistory failed', error);
    }
  }

  /**
   * Cambiar contraseña de usuario autenticado
   * @param userId ID del usuario autenticado
   * @param changePasswordDto Datos para cambio de contraseña
   */
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'La nueva contraseña y su confirmación no coinciden',
      );
    }

    // Buscar usuario con password incluido
    const user = await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ACTIVE },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Validar contraseña actual
    const isValidCurrentPassword = await user.validatePassword(currentPassword);
    if (!isValidCurrentPassword) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Validar que la nueva contraseña sea diferente de la actual
    const isSamePassword = await user.validatePassword(newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    // Actualizar contraseña (el hook @BeforeUpdate hashea automáticamente)
    user.password = newPassword;
    await this.userRepository.save(user);

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Solicitar recuperación de contraseña
   * @param forgotPasswordDto Email del usuario
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
    });

    // Por seguridad, siempre retornamos el mismo mensaje
    // aunque el usuario no exista
    if (!user) {
      return {
        message:
          'Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña',
      };
    }

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Token expira en 24 horas
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    // Guardar token y fecha de expiración
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expirationDate;
    await this.userRepository.save(user);

    // Enviar correo con token
    try {
      await this.mailService.sendPasswordResetEmail(user, resetToken);
    } catch (error) {
      console.error('Error enviando correo de recuperación:', error);
      throw new BadRequestException(
        'Error enviando correo de recuperación. Intenta nuevamente',
      );
    }

    return {
      message:
        'Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña',
    };
  }

  /**
   * Restablecer contraseña con token
   * @param resetPasswordDto Token y nueva contraseña
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'La nueva contraseña y su confirmación no coinciden',
      );
    }

    // Buscar usuario con token válido y no expirado
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
        status: UserStatus.ACTIVE,
      },
      select: [
        'id',
        'email',
        'password',
        'passwordResetToken',
        'passwordResetExpires',
      ],
    });

    if (!user) {
      throw new BadRequestException(
        'Token de recuperación inválido o expirado',
      );
    }

    // Validar que la nueva contraseña sea diferente de la actual
    const isSamePassword = await user.validatePassword(newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la anterior',
      );
    }

    // Actualizar contraseña y limpiar token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.userRepository.save(user);

    return {
      message: 'Contraseña restablecida exitosamente',
    };
  }

  /**
   * Actualizar perfil del usuario autenticado
   * @param userId ID del usuario autenticado
   * @param updateProfileDto Datos para actualizar el perfil
   */
  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ACTIVE },
      relations: ['documentType'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Registrar cambios para auditoría
    const changes: Record<string, { old: any; new: any }> = {};

    // Si se intenta cambiar el email, validar que no exista
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          'El email ya está registrado por otro usuario',
        );
      }

      changes.email = { old: user.email, new: updateProfileDto.email };
      user.email = updateProfileDto.email;
    }

    // Si se intenta cambiar el teléfono, validar que no exista
    if (
      updateProfileDto.phoneNumber &&
      updateProfileDto.phoneNumber !== user.phoneNumber
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: updateProfileDto.phoneNumber },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException(
          'El número de teléfono ya está registrado por otro usuario',
        );
      }

      changes.phoneNumber = {
        old: user.phoneNumber,
        new: updateProfileDto.phoneNumber,
      };
      user.phoneNumber = updateProfileDto.phoneNumber;
    }

    // Actualizar campos básicos solo si vienen en el DTO
    if (
      updateProfileDto.firstName !== undefined &&
      updateProfileDto.firstName !== user.firstName
    ) {
      changes.firstName = {
        old: user.firstName,
        new: updateProfileDto.firstName,
      };
      user.firstName = updateProfileDto.firstName;
    }

    if (
      updateProfileDto.secondName !== undefined &&
      updateProfileDto.secondName !== user.secondName
    ) {
      changes.secondName = {
        old: user.secondName,
        new: updateProfileDto.secondName,
      };
      user.secondName = updateProfileDto.secondName;
    }

    if (
      updateProfileDto.firstLastName !== undefined &&
      updateProfileDto.firstLastName !== user.firstLastName
    ) {
      changes.firstLastName = {
        old: user.firstLastName,
        new: updateProfileDto.firstLastName,
      };
      user.firstLastName = updateProfileDto.firstLastName;
    }

    if (
      updateProfileDto.secondLastName !== undefined &&
      updateProfileDto.secondLastName !== user.secondLastName
    ) {
      changes.secondLastName = {
        old: user.secondLastName,
        new: updateProfileDto.secondLastName,
      };
      user.secondLastName = updateProfileDto.secondLastName;
    }

    if (
      updateProfileDto.position !== undefined &&
      updateProfileDto.position !== user.position
    ) {
      changes.position = { old: user.position, new: updateProfileDto.position };
      user.position = updateProfileDto.position;
    }

    if (
      updateProfileDto.headquarters !== undefined &&
      updateProfileDto.headquarters !== user.headquarters
    ) {
      changes.headquarters = {
        old: user.headquarters,
        new: updateProfileDto.headquarters,
      };
      user.headquarters = updateProfileDto.headquarters;
    }

    if (
      updateProfileDto.documentNumber !== undefined &&
      updateProfileDto.documentNumber !== user.documentNumber
    ) {
      changes.documentNumber = {
        old: user.documentNumber,
        new: updateProfileDto.documentNumber,
      };
      user.documentNumber = updateProfileDto.documentNumber;
    }

    if (
      updateProfileDto.address !== undefined &&
      updateProfileDto.address !== user.address
    ) {
      changes.address = { old: user.address, new: updateProfileDto.address };
      user.address = updateProfileDto.address;
    }

    if (
      updateProfileDto.city !== undefined &&
      updateProfileDto.city !== user.city
    ) {
      changes.city = { old: user.city, new: updateProfileDto.city };
      user.city = updateProfileDto.city;
    }

    if (updateProfileDto.birthDate !== undefined) {
      const newBirthDate = new Date(updateProfileDto.birthDate);
      const oldBirthDate = user.birthDate ? new Date(user.birthDate) : null;

      if (!oldBirthDate || newBirthDate.getTime() !== oldBirthDate.getTime()) {
        changes.birthDate = {
          old: oldBirthDate?.toISOString().split('T')[0],
          new: updateProfileDto.birthDate,
        };
        user.birthDate = newBirthDate;
      }
    }

    if (
      updateProfileDto.documentTypeId !== undefined &&
      updateProfileDto.documentTypeId !== user.documentTypeId
    ) {
      changes.documentTypeId = {
        old: user.documentTypeId,
        new: updateProfileDto.documentTypeId,
      };
      user.documentTypeId = updateProfileDto.documentTypeId;
    }

    // Registrar cambios en log de auditoría
    if (Object.keys(changes).length > 0) {
      this.logger.log(
        `Usuario ${user.id} (${user.email}) actualizó su perfil. Cambios: ${JSON.stringify(changes)}`,
      );
    } else {
      this.logger.log(
        `Usuario ${user.id} (${user.email}) intentó actualizar perfil sin cambios`,
      );
    }

    // Guardar usuario actualizado
    await this.userRepository.save(user);

    // Recargar con relaciones para retornar completo
    const reloadedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['documentType', 'country'],
    });

    if (!reloadedUser) {
      throw new NotFoundException('Error al recargar el usuario actualizado');
    }

    return reloadedUser;
  }

  private generatePassword(length = 12): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%&*';
    const all = upper + lower + digits + special;
    const rand = (chars: string) =>
      chars[Math.floor(Math.random() * chars.length)];
    const password = [rand(upper), rand(lower), rand(digits), rand(special)];
    for (let i = password.length; i < length; i++) {
      password.push(rand(all));
    }
    return password.sort(() => Math.random() - 0.5).join('');
  }
}
