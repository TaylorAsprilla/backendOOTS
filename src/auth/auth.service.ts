import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { UserStatus } from '../common/enums';
import { MailService } from '../mail/mail.service';

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
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException('User with this email already exists');
      }

      // Verificar si ya existe un usuario con el mismo número de teléfono
      if (registerDto.phoneNumber) {
        const existingUserByPhone = await this.userRepository.findOne({
          where: { phoneNumber: registerDto.phoneNumber },
        });

        if (existingUserByPhone) {
          throw new ConflictException(
            'User with this phone number already exists',
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
}
