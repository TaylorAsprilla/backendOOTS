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
import { CASE_ASSIGNABLE_ROLES, Role } from '../common/enums/role.enum';
import { RoleEntity } from '../roles/entities/role.entity';
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

  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<User> {
    createUserDto = await this.applyCountryAdminRules(
      createUserDto,
      currentUser,
    );

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
    const { password, avatarKey, ...result } = user;
    // La clave interna del archivo en S3 no se expone: solo si tiene foto
    return { ...result, hasAvatar: !!avatarKey } as unknown as User;
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

  /**
   * Profesionales activos de cualquier país que pueden recibir un caso.
   * Devuelve solo datos mínimos: no se exponen documento, correo ni teléfono.
   */
  async findTransferCandidates() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.country', 'country')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('role.name IN (:...roles)', { roles: CASE_ASSIGNABLE_ROLES })
      .orderBy('user.firstName', 'ASC')
      .addOrderBy('user.firstLastName', 'ASC')
      .getMany();

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      secondName: user.secondName ?? null,
      firstLastName: user.firstLastName,
      secondLastName: user.secondLastName ?? null,
      roleName: user.role?.name ?? null,
      countryId: user.countryId ?? null,
      countryName: user.country?.name ?? null,
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
    // Verificar que el usuario existe y está activo
    const existingUser = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    assertCountryAccess(currentUser, existingUser.countryId);
    if (
      getAdminCountryId(currentUser) !== undefined &&
      updateUserDto.password !== undefined
    ) {
      throw new ForbiddenException(
        'El administrador de país no puede cambiar contraseñas desde la edición',
      );
    }
    updateUserDto = await this.applyCountryAdminRules(
      updateUserDto,
      currentUser,
    );

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
    // Verificar que el usuario existe y está activo
    const existingUser = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    assertCountryAccess(currentUser, existingUser.countryId);
    if (currentUser && Number(currentUser.id) === Number(id)) {
      throw new ForbiddenException('No puede eliminar su propio usuario');
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
    // Verificar que el usuario existe y está eliminado
    const existingUser = await this.userRepository.findOne({
      where: { id, status: UserStatus.DELETED },
    });

    if (!existingUser) {
      throw new NotFoundException(`Deleted user with ID ${id} not found`);
    }

    assertCountryAccess(currentUser, existingUser.countryId);

    // Restaurar el usuario
    await this.userRepository.update(id, { status: UserStatus.ACTIVE });

    // Obtener y devolver el usuario restaurado
    const restoredUser = await this.userRepository.findOne({
      where: { id },
    });

    return this.excludePassword(restoredUser!);
  }

  /**
   * Reglas para ADMIN_COUNTRY al crear/editar usuarios (ADMIN no se ve afectado):
   * - el usuario queda siempre en su propio país
   * - no puede asignar los roles ADMIN ni ADMIN_COUNTRY (evita escalar privilegios)
   */
  async applyCountryAdminRules<T extends Partial<CreateUserDto>>(
    dto: T,
    currentUser?: User,
  ): Promise<T> {
    const adminCountryId = getAdminCountryId(currentUser);
    if (adminCountryId === undefined) return dto;

    if (dto.countryId !== undefined) {
      assertCountryAccess(currentUser, dto.countryId);
    }

    if (dto.roleId !== undefined) {
      const role = await this.userRepository.manager.findOne(RoleEntity, {
        where: { id: dto.roleId },
      });
      if (!role) {
        throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
      }
      if (role.name === Role.ADMIN || role.name === Role.ADMIN_COUNTRY) {
        throw new ForbiddenException(
          'No puede asignar roles de administrador',
        );
      }
    }

    return { ...dto, countryId: adminCountryId };
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
