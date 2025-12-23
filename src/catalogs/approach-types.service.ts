import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproachType } from './entities/approach-type.entity';
import { CreateApproachTypeDto } from './dto/create-approach-type.dto';
import { UpdateApproachTypeDto } from './dto/update-approach-type.dto';

@Injectable()
export class ApproachTypesService {
  private readonly logger = new Logger(ApproachTypesService.name);

  constructor(
    @InjectRepository(ApproachType)
    private readonly approachTypeRepository: Repository<ApproachType>,
  ) {}

  /**
   * Crear un nuevo tipo de abordaje
   */
  async create(
    createApproachTypeDto: CreateApproachTypeDto,
  ): Promise<ApproachType> {
    this.logger.log(`Creando tipo de abordaje: ${createApproachTypeDto.name}`);

    // Verificar si ya existe un tipo de abordaje con el mismo nombre
    const existing = await this.approachTypeRepository.findOne({
      where: { name: createApproachTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de abordaje con el nombre "${createApproachTypeDto.name}"`,
      );
    }

    const approachType = this.approachTypeRepository.create(
      createApproachTypeDto,
    );
    const saved = await this.approachTypeRepository.save(approachType);

    this.logger.log(`Tipo de abordaje creado con ID: ${saved.id}`);
    return saved;
  }

  /**
   * Obtener todos los tipos de abordaje
   */
  async findAll(includeInactive = false): Promise<ApproachType[]> {
    this.logger.log('Obteniendo todos los tipos de abordaje');

    const queryBuilder =
      this.approachTypeRepository.createQueryBuilder('approachType');

    if (!includeInactive) {
      queryBuilder.where('approachType.isActive = :isActive', {
        isActive: true,
      });
    }

    return queryBuilder.orderBy('approachType.name', 'ASC').getMany();
  }

  /**
   * Obtener un tipo de abordaje por ID
   */
  async findOne(id: number): Promise<ApproachType> {
    this.logger.log(`Buscando tipo de abordaje con ID: ${id}`);

    const approachType = await this.approachTypeRepository.findOne({
      where: { id },
    });

    if (!approachType) {
      throw new NotFoundException(
        `Tipo de abordaje con ID ${id} no encontrado`,
      );
    }

    return approachType;
  }

  /**
   * Actualizar un tipo de abordaje
   */
  async update(
    id: number,
    updateApproachTypeDto: UpdateApproachTypeDto,
  ): Promise<ApproachType> {
    this.logger.log(`Actualizando tipo de abordaje con ID: ${id}`);

    const approachType = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (
      updateApproachTypeDto.name &&
      updateApproachTypeDto.name !== approachType.name
    ) {
      const existing = await this.approachTypeRepository.findOne({
        where: { name: updateApproachTypeDto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un tipo de abordaje con el nombre "${updateApproachTypeDto.name}"`,
        );
      }
    }

    Object.assign(approachType, updateApproachTypeDto);
    const updated = await this.approachTypeRepository.save(approachType);

    this.logger.log(`Tipo de abordaje con ID ${id} actualizado`);
    return updated;
  }

  /**
   * Eliminar (desactivar) un tipo de abordaje
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Desactivando tipo de abordaje con ID: ${id}`);

    const approachType = await this.findOne(id);
    approachType.isActive = false;
    await this.approachTypeRepository.save(approachType);

    this.logger.log(`Tipo de abordaje con ID ${id} desactivado`);
  }
}
