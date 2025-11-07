import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicLevel } from './entities/academic-level.entity';
import { CreateAcademicLevelDto } from './dto/create-academic-level.dto';
import { UpdateAcademicLevelDto } from './dto/update-academic-level.dto';

@Injectable()
export class AcademicLevelsService {
  private readonly logger = new Logger(AcademicLevelsService.name);

  constructor(
    @InjectRepository(AcademicLevel)
    private readonly academicLevelRepository: Repository<AcademicLevel>,
  ) {}

  /**
   * Crear un nuevo nivel académico
   */
  async create(
    createAcademicLevelDto: CreateAcademicLevelDto,
  ): Promise<AcademicLevel> {
    try {
      // Verificar si ya existe un nivel académico con el mismo nombre
      const existingLevel = await this.academicLevelRepository.findOne({
        where: { name: createAcademicLevelDto.name },
      });

      if (existingLevel) {
        throw new ConflictException(
          `Ya existe un nivel académico con el nombre "${createAcademicLevelDto.name}"`,
        );
      }

      const academicLevel = this.academicLevelRepository.create(
        createAcademicLevelDto,
      );
      const savedLevel = await this.academicLevelRepository.save(academicLevel);

      this.logger.log(
        `Nivel académico creado: ${savedLevel.id} - ${savedLevel.name}`,
      );

      return savedLevel;
    } catch (error) {
      this.logger.error('Error al crear nivel académico:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los niveles académicos
   */
  async findAll(): Promise<AcademicLevel[]> {
    return this.academicLevelRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener solo los niveles académicos activos
   */
  async findActive(): Promise<AcademicLevel[]> {
    return this.academicLevelRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un nivel académico por ID
   */
  async findOne(id: number): Promise<AcademicLevel> {
    const academicLevel = await this.academicLevelRepository.findOne({
      where: { id },
    });

    if (!academicLevel) {
      throw new NotFoundException(`Nivel académico con ID ${id} no encontrado`);
    }

    return academicLevel;
  }

  /**
   * Actualizar un nivel académico
   */
  async update(
    id: number,
    updateAcademicLevelDto: UpdateAcademicLevelDto,
  ): Promise<AcademicLevel> {
    try {
      const academicLevel = await this.findOne(id);

      // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
      if (
        updateAcademicLevelDto.name &&
        updateAcademicLevelDto.name !== academicLevel.name
      ) {
        const existingLevel = await this.academicLevelRepository.findOne({
          where: { name: updateAcademicLevelDto.name },
        });

        if (existingLevel) {
          throw new ConflictException(
            `Ya existe un nivel académico con el nombre "${updateAcademicLevelDto.name}"`,
          );
        }
      }

      Object.assign(academicLevel, updateAcademicLevelDto);
      const updatedLevel =
        await this.academicLevelRepository.save(academicLevel);

      this.logger.log(
        `Nivel académico actualizado: ${updatedLevel.id} - ${updatedLevel.name}`,
      );

      return updatedLevel;
    } catch (error) {
      this.logger.error(`Error al actualizar nivel académico ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un nivel académico (soft delete - cambiar isActive a false)
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const academicLevel = await this.findOne(id);

      academicLevel.isActive = false;
      await this.academicLevelRepository.save(academicLevel);

      this.logger.log(
        `Nivel académico desactivado: ${academicLevel.id} - ${academicLevel.name}`,
      );

      return {
        message: `Nivel académico "${academicLevel.name}" desactivado exitosamente`,
      };
    } catch (error) {
      this.logger.error(`Error al desactivar nivel académico ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reactivar un nivel académico
   */
  async activate(id: number): Promise<AcademicLevel> {
    try {
      const academicLevel = await this.findOne(id);

      academicLevel.isActive = true;
      const activatedLevel =
        await this.academicLevelRepository.save(academicLevel);

      this.logger.log(
        `Nivel académico activado: ${activatedLevel.id} - ${activatedLevel.name}`,
      );

      return activatedLevel;
    } catch (error) {
      this.logger.error(`Error al activar nivel académico ${id}:`, error);
      throw error;
    }
  }
}
