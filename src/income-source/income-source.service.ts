import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIncomeSourceDto, UpdateIncomeSourceDto } from './dto';
import { IncomeSource } from './entities/income-source.entity';

@Injectable()
export class IncomeSourceService {
  private readonly logger = new Logger(IncomeSourceService.name);

  constructor(
    @InjectRepository(IncomeSource)
    private readonly incomeSourceRepository: Repository<IncomeSource>,
  ) {}

  async create(createDto: CreateIncomeSourceDto): Promise<IncomeSource> {
    const existing = await this.incomeSourceRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing)
      throw new ConflictException(
        `La fuente de ingreso "${createDto.name}" ya existe`,
      );
    const incomeSource = this.incomeSourceRepository.create(createDto);
    const saved = await this.incomeSourceRepository.save(incomeSource);
    this.logger.log(`Fuente de ingreso creada: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<IncomeSource[]> {
    return this.incomeSourceRepository.find({ order: { name: 'ASC' } });
  }

  async findActive(): Promise<IncomeSource[]> {
    return this.incomeSourceRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<IncomeSource> {
    const incomeSource = await this.incomeSourceRepository.findOne({
      where: { id },
    });
    if (!incomeSource)
      throw new NotFoundException(
        `Fuente de ingreso con ID ${id} no encontrada`,
      );
    return incomeSource;
  }

  async update(
    id: number,
    updateDto: UpdateIncomeSourceDto,
  ): Promise<IncomeSource> {
    const incomeSource = await this.findOne(id);
    if (updateDto.name && updateDto.name !== incomeSource.name) {
      const existing = await this.incomeSourceRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing)
        throw new ConflictException(
          `La fuente de ingreso "${updateDto.name}" ya existe`,
        );
    }
    Object.assign(incomeSource, updateDto);
    const updated = await this.incomeSourceRepository.save(incomeSource);
    this.logger.log(`Fuente de ingreso actualizada: ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const incomeSource = await this.findOne(id);
    incomeSource.isActive = false;
    await this.incomeSourceRepository.save(incomeSource);
    this.logger.log(`Fuente de ingreso desactivada: ${id}`);
  }

  async activate(id: number): Promise<IncomeSource> {
    const incomeSource = await this.findOne(id);
    incomeSource.isActive = true;
    const activated = await this.incomeSourceRepository.save(incomeSource);
    this.logger.log(`Fuente de ingreso activada: ${id}`);
    return activated;
  }
}
