import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserStatus } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si ya existe un usuario con el mismo email
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Verificar si ya existe un usuario con el mismo número de teléfono
    if (createUserDto.phoneNumber) {
      const existingUserByPhone = await this.userRepository.findOne({
        where: { phoneNumber: createUserDto.phoneNumber },
      });

      if (existingUserByPhone) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    // Crear el nuevo usuario con conversión de fecha
    const newUser = this.userRepository.create({
      ...createUserDto,
      birthDate: createUserDto.birthDate
        ? new Date(createUserDto.birthDate)
        : undefined,
    });

    // Guardar el usuario en la base de datos
    const savedUser = await this.userRepository.save(newUser);

    // Remover la contraseña de la respuesta por seguridad
    return this.excludePassword(savedUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
      select: [
        'id',
        'firstName',
        'secondName',
        'firstLastName',
        'secondLastName',
        'email',
        'password',
        'phoneNumber',
        'position',
        'organization',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  private excludePassword(user: User): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { status: UserStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    // Remover contraseñas de todos los usuarios
    return users.map((user) => this.excludePassword(user));
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.excludePassword(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe y está activo
    const existingUser = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verificar unicidad de email si se está actualizando
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email, status: UserStatus.ACTIVE },
      });

      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Verificar unicidad de teléfono si se está actualizando
    if (
      updateUserDto.phoneNumber &&
      updateUserDto.phoneNumber !== existingUser.phoneNumber
    ) {
      const existingUserByPhone = await this.userRepository.findOne({
        where: {
          phoneNumber: updateUserDto.phoneNumber,
          status: UserStatus.ACTIVE,
        },
      });

      if (existingUserByPhone && existingUserByPhone.id !== id) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    // Preparar datos para actualizar con conversión de fecha
    const { birthDate, ...restData } = updateUserDto;
    const updateData: Partial<User> = {
      ...restData,
      ...(birthDate && { birthDate: new Date(birthDate) }),
    };

    // Actualizar el usuario
    await this.userRepository.update(id, updateData);

    // Obtener y devolver el usuario actualizado
    const updatedUser = await this.userRepository.findOne({
      where: { id },
    });

    return this.excludePassword(updatedUser!);
  }

  async remove(id: number): Promise<{ message: string }> {
    // Verificar que el usuario existe y está activo
    const existingUser = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete: cambiar el estado a 'deleted'
    await this.userRepository.update(id, { status: UserStatus.DELETED });

    return { message: `User with ID ${id} has been successfully deleted` };
  }

  async findAllWithDeleted(): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => this.excludePassword(user));
  }

  async restore(id: number): Promise<User> {
    // Verificar que el usuario existe y está eliminado
    const existingUser = await this.userRepository.findOne({
      where: { id, status: UserStatus.DELETED },
    });

    if (!existingUser) {
      throw new NotFoundException(`Deleted user with ID ${id} not found`);
    }

    // Restaurar el usuario
    await this.userRepository.update(id, { status: UserStatus.ACTIVE });

    // Obtener y devolver el usuario restaurado
    const restoredUser = await this.userRepository.findOne({
      where: { id },
    });

    return this.excludePassword(restoredUser!);
  }
}
