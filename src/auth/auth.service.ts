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
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
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

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  firstLastName: string;
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
  token_type: string;
  expires_in: number;
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly geolocationService: GeolocationService,
  ) {}

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
      const newUser = this.userRepository.create({
        firstName: registerDto.firstName,
        secondName: registerDto.secondName,
        firstLastName: registerDto.firstLastName,
        secondLastName: registerDto.secondLastName,
        email: registerDto.email,
        password: registerDto.password,
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
        status: UserStatus.ACTIVE,
      });

      // Guardar el usuario en la base de datos
      const savedUser = await this.userRepository.save(newUser);

      // Enviar correo de bienvenida de forma asíncrona (no bloquea la respuesta)
      // Pasar la contraseña original (sin hashear) para mostrarla en el correo
      this.mailService
        .sendUserRegistrationEmail(savedUser, registerDto.password)
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
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'secondName',
        'firstLastName',
        'secondLastName',
        'phoneNumber',
        'position',
        'headquarters',
        'status',
        'createdAt',
        'updatedAt',
      ],
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
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: user.toResponseObject(),
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
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: user.toResponseObject(),
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
      // No lanzamos el error para que no afecte el login
      console.error(
        `Error guardando geolocalización para usuario ${userId}:`,
        error,
      );
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

    // Actualizar redes sociales
    if (
      updateProfileDto.facebook !== undefined &&
      updateProfileDto.facebook !== user.facebook
    ) {
      changes.facebook = { old: user.facebook, new: updateProfileDto.facebook };
      user.facebook = updateProfileDto.facebook;
    }

    if (
      updateProfileDto.twitter !== undefined &&
      updateProfileDto.twitter !== user.twitter
    ) {
      changes.twitter = { old: user.twitter, new: updateProfileDto.twitter };
      user.twitter = updateProfileDto.twitter;
    }

    if (
      updateProfileDto.instagram !== undefined &&
      updateProfileDto.instagram !== user.instagram
    ) {
      changes.instagram = {
        old: user.instagram,
        new: updateProfileDto.instagram,
      };
      user.instagram = updateProfileDto.instagram;
    }

    if (
      updateProfileDto.linkedin !== undefined &&
      updateProfileDto.linkedin !== user.linkedin
    ) {
      changes.linkedin = { old: user.linkedin, new: updateProfileDto.linkedin };
      user.linkedin = updateProfileDto.linkedin;
    }

    if (
      updateProfileDto.github !== undefined &&
      updateProfileDto.github !== user.github
    ) {
      changes.github = { old: user.github, new: updateProfileDto.github };
      user.github = updateProfileDto.github;
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
      relations: ['documentType'],
    });

    if (!reloadedUser) {
      throw new NotFoundException('Error al recargar el usuario actualizado');
    }

    return reloadedUser;
  }
}
