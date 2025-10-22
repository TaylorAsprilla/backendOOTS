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
import { CreateUserDto, LoginDto } from './dto';
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
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      // Crear el usuario (el password se hashea automáticamente con @BeforeInsert)
      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);

      // Generar JWT
      const payload: JwtPayload = {
        sub: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        firstLastName: savedUser.firstLastName,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: savedUser.toResponseObject(),
      };
    } catch {
      throw new BadRequestException('Failed to create user');
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
        'organization',
        'status',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validar password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
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
      user: user.toResponseObject(),
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const { sub } = payload;
    const user = await this.userRepository.findOne({
      where: { id: sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
