import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserStatus } from '../common/enums';
import { MailService } from '../mail/mail.service';
import {
  assertCountryAccess,
  countryScope,
  getAdminCountryId,
} from '../common/utils/country-access';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  private generatePassword(length = 12): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '!@#$%&*';
    const all = upper + lower + digits + special;
    let password =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      digits[Math.floor(Math.random() * digits.length)] +
      special[Math.floor(Math.random() * special.length)];
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

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

    // Generar contraseña si no se proporcionó
    const plainPassword = createUserDto.password ?? this.generatePassword();

    // Crear el nuevo usuario con conversión de fecha
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: plainPassword,
      birthDate: createUserDto.birthDate
        ? new Date(createUserDto.birthDate)
        : undefined,
    });

    // Guardar el usuario en la base de datos
    const savedUser = await this.userRepository.save(newUser);

    // Enviar email con credenciales
    this.mailService
      .sendUserRegistrationEmail(savedUser, plainPassword)
      .catch(() => {});

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
        'headquarters',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async checkDocumentNumber(
    documentNumber: string,
    currentUser?: User,
  ): Promise<{ exists: boolean; message: string }> {
    if (!documentNumber || documentNumber.trim() === '') {
      return {
        exists: false,
        message: 'Document number is required',
      };
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        documentNumber,
        status: UserStatus.ACTIVE,
        ...countryScope(currentUser),
      },
    });

    if (existingUser) {
      return {
        exists: true,
        message: 'Document number already exists',
      };
    }

    return {
      exists: false,
      message: 'Document number is available',
    };
  }

  async checkMitaNumber(
    mitaNumber: number,
    currentUser?: User,
  ): Promise<{ exists: boolean; message: string }> {
    if (!mitaNumber) {
      return {
        exists: false,
        message: 'Mita number is required',
      };
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        mitaNumber,
        status: UserStatus.ACTIVE,
        ...countryScope(currentUser),
      },
    });

    if (existingUser) {
      return {
        exists: true,
        message: 'Mita number already exists',
      };
    }

    return {
      exists: false,
      message: 'Mita number is available',
    };
  }

  private excludePassword(user: User): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result as User;
  }

  async findAll(currentUser?: User): Promise<any[]> {
    const countryId = getAdminCountryId(currentUser);
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.country', 'country')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect(
        (sub) => {
          const count = sub
            .select('COUNT(p.id)', 'cnt')
            .from('participants', 'p')
            .where('p.registered_by_id = user.id');
          if (countryId !== undefined) {
            count.andWhere('p.country_id = :countryId', { countryId });
          }
          return count;
        },
        'participantCount',
      )
      .addSelect(
        (sub) => {
          const count = sub
            .select('COUNT(c.id)', 'cnt')
            .from('cases', 'c')
            .innerJoin('participants', 'p', 'p.id = c.participant_id')
            .where('p.registered_by_id = user.id');
          if (countryId !== undefined) {
            count.andWhere('p.country_id = :countryId', { countryId });
          }
          return count;
        },
        'caseCount',
      )
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .orderBy('user.createdAt', 'DESC');
    if (countryId !== undefined) {
      query.andWhere('user.countryId = :countryId', { countryId });
    }
    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((user, i) => ({
      ...this.excludePassword(user),
      participantCount: parseInt(raw[i]?.participantCount ?? '0', 10),
      caseCount: parseInt(raw[i]?.caseCount ?? '0', 10),
    }));
  }

  async findOne(id: number, currentUser?: User): Promise<User> {
    getAdminCountryId(currentUser);
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    assertCountryAccess(currentUser, user.countryId);
    return this.excludePassword(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser?: User,
  ): Promise<User> {
    this.assertCanManageUsers(currentUser);
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

  async remove(id: number, currentUser?: User): Promise<{ message: string }> {
    this.assertCanManageUsers(currentUser);
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

  async findAllWithDeleted(currentUser?: User): Promise<User[]> {
    const users = await this.userRepository.find({
      where: countryScope(currentUser),
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => this.excludePassword(user));
  }

  async restore(id: number, currentUser?: User): Promise<User> {
    this.assertCanManageUsers(currentUser);
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

  private assertCanManageUsers(currentUser?: User): void {
    if (getAdminCountryId(currentUser) !== undefined) {
      throw new ForbiddenException(
        'El administrador de país solo puede consultar usuarios',
      );
    }
  }

  async adminResetPassword(
    id: number,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    this.mailService
      .sendUserRegistrationEmail(user, newPassword)
      .catch(() => {});

    return { message: 'Contraseña restablecida exitosamente' };
  }
}
