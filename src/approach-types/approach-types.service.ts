import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproachType } from '../common/entities/approach-type.entity';
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
    try {
      // Verificar si ya existe un tipo de abordaje con el mismo nombre
      const existingType = await this.approachTypeRepository.findOne({
        where: { name: createApproachTypeDto.name },
      });

      if (existingType) {
        throw new ConflictException(
          `Ya existe un tipo de abordaje con el nombre "${createApproachTypeDto.name}"`,
        );
      }

      const approachType = this.approachTypeRepository.create(
        createApproachTypeDto,
      );
      const savedType = await this.approachTypeRepository.save(approachType);

      this.logger.log(
        `Tipo de abordaje creado: ${savedType.id} - ${savedType.name}`,
      );

      return savedType;
    } catch (error) {
      this.logger.error('Error al crear tipo de abordaje:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tipos de abordaje
   */
  async findAll(): Promise<ApproachType[]> {
    return this.approachTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener solo los tipos de abordaje activos
   */
  async findActive(): Promise<ApproachType[]> {
    return this.approachTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un tipo de abordaje por ID
   */
  async findOne(id: number): Promise<ApproachType> {
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
    try {
      const approachType = await this.findOne(id);

      // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
      if (
        updateApproachTypeDto.name &&
        updateApproachTypeDto.name !== approachType.name
      ) {
        const existingType = await this.approachTypeRepository.findOne({
          where: { name: updateApproachTypeDto.name },
        });

        if (existingType) {
          throw new ConflictException(
            `Ya existe un tipo de abordaje con el nombre "${updateApproachTypeDto.name}"`,
          );
        }
      }

      Object.assign(approachType, updateApproachTypeDto);
      const updatedType = await this.approachTypeRepository.save(approachType);

      this.logger.log(
        `Tipo de abordaje actualizado: ${updatedType.id} - ${updatedType.name}`,
      );

      return updatedType;
    } catch (error) {
      this.logger.error(`Error al actualizar tipo de abordaje ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de abordaje (soft delete - cambiar isActive a false)
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const approachType = await this.findOne(id);

      approachType.isActive = false;
      await this.approachTypeRepository.save(approachType);

      this.logger.log(
        `Tipo de abordaje desactivado: ${approachType.id} - ${approachType.name}`,
      );

      return {
        message: `Tipo de abordaje "${approachType.name}" desactivado exitosamente`,
      };
    } catch (error) {
      this.logger.error(`Error al desactivar tipo de abordaje ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reactivar un tipo de abordaje
   */
  async activate(id: number): Promise<ApproachType> {
    try {
      const approachType = await this.findOne(id);

      approachType.isActive = true;
      const activatedType =
        await this.approachTypeRepository.save(approachType);

      this.logger.log(
        `Tipo de abordaje activado: ${activatedType.id} - ${activatedType.name}`,
      );

      return activatedType;
    } catch (error) {
      this.logger.error(`Error al activar tipo de abordaje ${id}:`, error);
      throw error;
    }
  }
}
