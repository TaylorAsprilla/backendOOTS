import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHousingTypeDto, UpdateHousingTypeDto } from './dto';
import { HousingType } from './entities/housing-type.entity';

@Injectable()
export class HousingTypeService {
  private readonly logger = new Logger(HousingTypeService.name);

  constructor(
    @InjectRepository(HousingType)
    private readonly housingTypeRepository: Repository<HousingType>,
  ) {}

  async create(createDto: CreateHousingTypeDto): Promise<HousingType> {
    const existing = await this.housingTypeRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing)
      throw new ConflictException(
        `El tipo de vivienda "${createDto.name}" ya existe`,
      );
    const housingType = this.housingTypeRepository.create(createDto);
    const saved = await this.housingTypeRepository.save(housingType);
    this.logger.log(`Tipo de vivienda creado: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<HousingType[]> {
    return this.housingTypeRepository.find({ order: { name: 'ASC' } });
  }

  async findActive(): Promise<HousingType[]> {
    return this.housingTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<HousingType> {
    const housingType = await this.housingTypeRepository.findOne({
      where: { id },
    });
    if (!housingType)
      throw new NotFoundException(
        `Tipo de vivienda con ID ${id} no encontrado`,
      );
    return housingType;
  }

  async update(
    id: number,
    updateDto: UpdateHousingTypeDto,
  ): Promise<HousingType> {
    const housingType = await this.findOne(id);
    if (updateDto.name && updateDto.name !== housingType.name) {
      const existing = await this.housingTypeRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing)
        throw new ConflictException(
          `El tipo de vivienda "${updateDto.name}" ya existe`,
        );
    }
    Object.assign(housingType, updateDto);
    const updated = await this.housingTypeRepository.save(housingType);
    this.logger.log(`Tipo de vivienda actualizado: ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const housingType = await this.findOne(id);
    housingType.isActive = false;
    await this.housingTypeRepository.save(housingType);
    this.logger.log(`Tipo de vivienda desactivado: ${id}`);
  }

  async activate(id: number): Promise<HousingType> {
    const housingType = await this.findOne(id);
    housingType.isActive = true;
    const activated = await this.housingTypeRepository.save(housingType);
    this.logger.log(`Tipo de vivienda activado: ${id}`);
    return activated;
  }
}
