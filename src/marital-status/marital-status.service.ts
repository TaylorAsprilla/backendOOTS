import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaritalStatus } from './entities/marital-status.entity';
import { CreateMaritalStatusDto } from './dto/create-marital-status.dto';
import { UpdateMaritalStatusDto } from './dto/update-marital-status.dto';

@Injectable()
export class MaritalStatusService {
  private readonly logger = new Logger(MaritalStatusService.name);

  constructor(
    @InjectRepository(MaritalStatus)
    private readonly maritalStatusRepository: Repository<MaritalStatus>,
  ) {}

  async create(
    createMaritalStatusDto: CreateMaritalStatusDto,
  ): Promise<MaritalStatus> {
    const existingMaritalStatus = await this.maritalStatusRepository.findOne({
      where: { name: createMaritalStatusDto.name },
    });

    if (existingMaritalStatus) {
      throw new ConflictException(
        `Ya existe un estado civil con el nombre "${createMaritalStatusDto.name}"`,
      );
    }

    const maritalStatus = this.maritalStatusRepository.create(
      createMaritalStatusDto,
    );
    const savedMaritalStatus =
      await this.maritalStatusRepository.save(maritalStatus);

    this.logger.log(
      `Estado civil creado: ${savedMaritalStatus.id} - ${savedMaritalStatus.name}`,
    );

    return savedMaritalStatus;
  }

  async findAll(): Promise<MaritalStatus[]> {
    return this.maritalStatusRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<MaritalStatus[]> {
    return this.maritalStatusRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<MaritalStatus> {
    const maritalStatus = await this.maritalStatusRepository.findOne({
      where: { id },
    });

    if (!maritalStatus) {
      throw new NotFoundException(`Estado civil con ID ${id} no encontrado`);
    }

    return maritalStatus;
  }

  async update(
    id: number,
    updateMaritalStatusDto: UpdateMaritalStatusDto,
  ): Promise<MaritalStatus> {
    const maritalStatus = await this.findOne(id);

    if (
      updateMaritalStatusDto.name &&
      updateMaritalStatusDto.name !== maritalStatus.name
    ) {
      const existingMaritalStatus = await this.maritalStatusRepository.findOne({
        where: { name: updateMaritalStatusDto.name },
      });

      if (existingMaritalStatus) {
        throw new ConflictException(
          `Ya existe un estado civil con el nombre "${updateMaritalStatusDto.name}"`,
        );
      }
    }

    Object.assign(maritalStatus, updateMaritalStatusDto);
    const updatedMaritalStatus =
      await this.maritalStatusRepository.save(maritalStatus);

    this.logger.log(
      `Estado civil actualizado: ${updatedMaritalStatus.id} - ${updatedMaritalStatus.name}`,
    );

    return updatedMaritalStatus;
  }

  async remove(id: number): Promise<{ message: string }> {
    const maritalStatus = await this.findOne(id);

    maritalStatus.isActive = false;
    await this.maritalStatusRepository.save(maritalStatus);

    this.logger.log(
      `Estado civil desactivado: ${maritalStatus.id} - ${maritalStatus.name}`,
    );

    return {
      message: `Estado civil "${maritalStatus.name}" desactivado exitosamente`,
    };
  }

  async activate(id: number): Promise<MaritalStatus> {
    const maritalStatus = await this.findOne(id);

    maritalStatus.isActive = true;
    const activatedMaritalStatus =
      await this.maritalStatusRepository.save(maritalStatus);

    this.logger.log(
      `Estado civil activado: ${activatedMaritalStatus.id} - ${activatedMaritalStatus.name}`,
    );

    return activatedMaritalStatus;
  }
}
