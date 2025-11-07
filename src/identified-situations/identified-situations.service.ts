import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentifiedSituation } from './entities/identified-situation.entity';
import { CreateIdentifiedSituationDto } from './dto/create-identified-situation.dto';
import { UpdateIdentifiedSituationDto } from './dto/update-identified-situation.dto';

@Injectable()
export class IdentifiedSituationsService {
  constructor(
    @InjectRepository(IdentifiedSituation)
    private readonly identifiedSituationRepository: Repository<IdentifiedSituation>,
  ) {}

  async create(
    createDto: CreateIdentifiedSituationDto,
  ): Promise<IdentifiedSituation> {
    // Verificar si ya existe una situación con el mismo nombre
    const existing = await this.identifiedSituationRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(
        'Identified situation with this name already exists',
      );
    }

    const situation = this.identifiedSituationRepository.create(createDto);
    return await this.identifiedSituationRepository.save(situation);
  }

  async findAll(): Promise<IdentifiedSituation[]> {
    return await this.identifiedSituationRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findAllWithInactive(): Promise<IdentifiedSituation[]> {
    return await this.identifiedSituationRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<IdentifiedSituation> {
    const situation = await this.identifiedSituationRepository.findOne({
      where: { id },
    });

    if (!situation) {
      throw new NotFoundException(
        `Identified situation with ID ${id} not found`,
      );
    }

    return situation;
  }

  async update(
    id: number,
    updateDto: UpdateIdentifiedSituationDto,
  ): Promise<IdentifiedSituation> {
    const situation = await this.findOne(id);

    // Verificar unicidad del nombre si se está actualizando
    if (updateDto.name && updateDto.name !== situation.name) {
      const existing = await this.identifiedSituationRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Identified situation with this name already exists',
        );
      }
    }

    await this.identifiedSituationRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const situation = await this.findOne(id);

    // Soft delete: cambiar isActive a false
    await this.identifiedSituationRepository.update(id, { isActive: false });

    return {
      message: `Identified situation "${situation.name}" has been deactivated`,
    };
  }

  async restore(id: number): Promise<IdentifiedSituation> {
    const situation = await this.findOne(id);

    if (situation.isActive) {
      throw new ConflictException('Identified situation is already active');
    }

    await this.identifiedSituationRepository.update(id, { isActive: true });
    return await this.findOne(id);
  }

  async hardDelete(id: number): Promise<{ message: string }> {
    const situation = await this.findOne(id);

    await this.identifiedSituationRepository.delete(id);

    return {
      message: `Identified situation "${situation.name}" has been permanently deleted`,
    };
  }
}
