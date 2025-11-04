import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from './entities/gender.entity';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Injectable()
export class GendersService {
  private readonly logger = new Logger(GendersService.name);

  constructor(
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
  ) {}

  /**
   * Crear un nuevo género
   */
  async create(createGenderDto: CreateGenderDto): Promise<Gender> {
    try {
      // Verificar si ya existe un género con el mismo nombre
      const existingGender = await this.genderRepository.findOne({
        where: { name: createGenderDto.name },
      });

      if (existingGender) {
        throw new ConflictException(
          `Ya existe un género con el nombre "${createGenderDto.name}"`,
        );
      }

      const gender = this.genderRepository.create(createGenderDto);
      const savedGender = await this.genderRepository.save(gender);

      this.logger.log(`Género creado: ${savedGender.id} - ${savedGender.name}`);

      return savedGender;
    } catch (error) {
      this.logger.error('Error al crear género:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los géneros
   */
  async findAll(): Promise<Gender[]> {
    return this.genderRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener solo los géneros activos
   */
  async findActive(): Promise<Gender[]> {
    return this.genderRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un género por ID
   */
  async findOne(id: number): Promise<Gender> {
    const gender = await this.genderRepository.findOne({
      where: { id },
    });

    if (!gender) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    return gender;
  }

  /**
   * Actualizar un género
   */
  async update(id: number, updateGenderDto: UpdateGenderDto): Promise<Gender> {
    try {
      const gender = await this.findOne(id);

      // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
      if (updateGenderDto.name && updateGenderDto.name !== gender.name) {
        const existingGender = await this.genderRepository.findOne({
          where: { name: updateGenderDto.name },
        });

        if (existingGender) {
          throw new ConflictException(
            `Ya existe un género con el nombre "${updateGenderDto.name}"`,
          );
        }
      }

      Object.assign(gender, updateGenderDto);
      const updatedGender = await this.genderRepository.save(gender);

      this.logger.log(
        `Género actualizado: ${updatedGender.id} - ${updatedGender.name}`,
      );

      return updatedGender;
    } catch (error) {
      this.logger.error(`Error al actualizar género ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un género (soft delete - cambiar isActive a false)
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const gender = await this.findOne(id);

      gender.isActive = false;
      await this.genderRepository.save(gender);

      this.logger.log(`Género desactivado: ${gender.id} - ${gender.name}`);

      return {
        message: `Género "${gender.name}" desactivado exitosamente`,
      };
    } catch (error) {
      this.logger.error(`Error al desactivar género ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reactivar un género
   */
  async activate(id: number): Promise<Gender> {
    try {
      const gender = await this.findOne(id);

      gender.isActive = true;
      const activatedGender = await this.genderRepository.save(gender);

      this.logger.log(
        `Género activado: ${activatedGender.id} - ${activatedGender.name}`,
      );

      return activatedGender;
    } catch (error) {
      this.logger.error(`Error al activar género ${id}:`, error);
      throw error;
    }
  }
}
