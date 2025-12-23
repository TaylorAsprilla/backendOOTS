import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessType } from './entities/process-type.entity';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { UpdateProcessTypeDto } from './dto/update-process-type.dto';

@Injectable()
export class ProcessTypesService {
  private readonly logger = new Logger(ProcessTypesService.name);

  constructor(
    @InjectRepository(ProcessType)
    private readonly processTypeRepository: Repository<ProcessType>,
  ) {}

  /**
   * Crear un nuevo tipo de proceso
   */
  async create(
    createProcessTypeDto: CreateProcessTypeDto,
  ): Promise<ProcessType> {
    this.logger.log(`Creando tipo de proceso: ${createProcessTypeDto.name}`);

    // Verificar si ya existe un tipo de proceso con el mismo nombre
    const existing = await this.processTypeRepository.findOne({
      where: { name: createProcessTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de proceso con el nombre "${createProcessTypeDto.name}"`,
      );
    }

    const processType = this.processTypeRepository.create(createProcessTypeDto);
    const saved = await this.processTypeRepository.save(processType);

    this.logger.log(`Tipo de proceso creado con ID: ${saved.id}`);
    return saved;
  }

  /**
   * Obtener todos los tipos de proceso
   */
  async findAll(includeInactive = false): Promise<ProcessType[]> {
    this.logger.log('Obteniendo todos los tipos de proceso');

    const queryBuilder =
      this.processTypeRepository.createQueryBuilder('processType');

    if (!includeInactive) {
      queryBuilder.where('processType.isActive = :isActive', {
        isActive: true,
      });
    }

    return queryBuilder.orderBy('processType.name', 'ASC').getMany();
  }

  /**
   * Obtener un tipo de proceso por ID
   */
  async findOne(id: number): Promise<ProcessType> {
    this.logger.log(`Buscando tipo de proceso con ID: ${id}`);

    const processType = await this.processTypeRepository.findOne({
      where: { id },
    });

    if (!processType) {
      throw new NotFoundException(`Tipo de proceso con ID ${id} no encontrado`);
    }

    return processType;
  }

  /**
   * Actualizar un tipo de proceso
   */
  async update(
    id: number,
    updateProcessTypeDto: UpdateProcessTypeDto,
  ): Promise<ProcessType> {
    this.logger.log(`Actualizando tipo de proceso con ID: ${id}`);

    const processType = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (
      updateProcessTypeDto.name &&
      updateProcessTypeDto.name !== processType.name
    ) {
      const existing = await this.processTypeRepository.findOne({
        where: { name: updateProcessTypeDto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un tipo de proceso con el nombre "${updateProcessTypeDto.name}"`,
        );
      }
    }

    Object.assign(processType, updateProcessTypeDto);
    const updated = await this.processTypeRepository.save(processType);

    this.logger.log(`Tipo de proceso con ID ${id} actualizado`);
    return updated;
  }

  /**
   * Eliminar (desactivar) un tipo de proceso
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Desactivando tipo de proceso con ID: ${id}`);

    const processType = await this.findOne(id);
    processType.isActive = false;
    await this.processTypeRepository.save(processType);

    this.logger.log(`Tipo de proceso con ID ${id} desactivado`);
  }
}
