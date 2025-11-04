import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIncomeLevelDto, UpdateIncomeLevelDto } from './dto';
import { IncomeLevel } from './entities/income-level.entity';

@Injectable()
export class IncomeLevelService {
  private readonly logger = new Logger(IncomeLevelService.name);

  constructor(
    @InjectRepository(IncomeLevel)
    private readonly incomeLevelRepository: Repository<IncomeLevel>,
  ) {}

  async create(createDto: CreateIncomeLevelDto): Promise<IncomeLevel> {
    const existing = await this.incomeLevelRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing)
      throw new ConflictException(
        `El nivel de ingreso "${createDto.name}" ya existe`,
      );
    const incomeLevel = this.incomeLevelRepository.create(createDto);
    const saved = await this.incomeLevelRepository.save(incomeLevel);
    this.logger.log(`Nivel de ingreso creado: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<IncomeLevel[]> {
    return this.incomeLevelRepository.find({ order: { name: 'ASC' } });
  }

  async findActive(): Promise<IncomeLevel[]> {
    return this.incomeLevelRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<IncomeLevel> {
    const incomeLevel = await this.incomeLevelRepository.findOne({
      where: { id },
    });
    if (!incomeLevel)
      throw new NotFoundException(
        `Nivel de ingreso con ID ${id} no encontrado`,
      );
    return incomeLevel;
  }

  async update(
    id: number,
    updateDto: UpdateIncomeLevelDto,
  ): Promise<IncomeLevel> {
    const incomeLevel = await this.findOne(id);
    if (updateDto.name && updateDto.name !== incomeLevel.name) {
      const existing = await this.incomeLevelRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing)
        throw new ConflictException(
          `El nivel de ingreso "${updateDto.name}" ya existe`,
        );
    }
    Object.assign(incomeLevel, updateDto);
    const updated = await this.incomeLevelRepository.save(incomeLevel);
    this.logger.log(`Nivel de ingreso actualizado: ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const incomeLevel = await this.findOne(id);
    incomeLevel.isActive = false;
    await this.incomeLevelRepository.save(incomeLevel);
    this.logger.log(`Nivel de ingreso desactivado: ${id}`);
  }

  async activate(id: number): Promise<IncomeLevel> {
    const incomeLevel = await this.findOne(id);
    incomeLevel.isActive = true;
    const activated = await this.incomeLevelRepository.save(incomeLevel);
    this.logger.log(`Nivel de ingreso activado: ${id}`);
    return activated;
  }
}
