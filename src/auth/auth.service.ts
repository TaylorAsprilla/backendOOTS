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
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { UserStatus } from '../common/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  firstLastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    phoneNumber?: string;
    position?: string;
    organization?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      // Convertir RegisterDto a CreateUserDto
      const createUserDto: CreateUserDto = {
        firstName: registerDto.firstName,
        secondName: registerDto.secondName,
        firstLastName: registerDto.firstLastName,
        secondLastName: registerDto.secondLastName,
        email: registerDto.email,
        password: registerDto.password,
        phoneNumber: registerDto.phoneNumber,
        position: registerDto.position,
        organization: registerDto.organization,
        documentNumber: registerDto.documentNumber,
        address: registerDto.address,
        city: registerDto.city,
        birthDate: registerDto.birthDate,
        documentTypeId: registerDto.documentTypeId,
      };

      // Usar el servicio de usuarios existente para crear el usuario
      const user = await this.usersService.create(createUserDto);

      // Generar JWT para el usuario recién creado
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
        user,
      };
    } catch (error) {
      // Si es un error de conflicto del UsersService, lo re-lanzamos
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
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
        'organization',
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
