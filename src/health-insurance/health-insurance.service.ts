import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthInsurance } from './entities/health-insurance.entity';
import { CreateHealthInsuranceDto } from './dto/create-health-insurance.dto';
import { UpdateHealthInsuranceDto } from './dto/update-health-insurance.dto';

@Injectable()
export class HealthInsuranceService {
  private readonly logger = new Logger(HealthInsuranceService.name);

  constructor(
    @InjectRepository(HealthInsurance)
    private readonly healthInsuranceRepository: Repository<HealthInsurance>,
  ) {}

  async create(
    createHealthInsuranceDto: CreateHealthInsuranceDto,
  ): Promise<HealthInsurance> {
    const existing = await this.healthInsuranceRepository.findOne({
      where: { name: createHealthInsuranceDto.name },
    });
    if (existing)
      throw new ConflictException(
        `Ya existe un seguro de salud con el nombre "${createHealthInsuranceDto.name}"`,
      );
    const healthInsurance = this.healthInsuranceRepository.create(
      createHealthInsuranceDto,
    );
    const saved = await this.healthInsuranceRepository.save(healthInsurance);
    this.logger.log(`Seguro de salud creado: ${saved.id} - ${saved.name}`);
    return saved;
  }

  async findAll(): Promise<HealthInsurance[]> {
    return this.healthInsuranceRepository.find({ order: { name: 'ASC' } });
  }

  async findActive(): Promise<HealthInsurance[]> {
    return this.healthInsuranceRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<HealthInsurance> {
    const healthInsurance = await this.healthInsuranceRepository.findOne({
      where: { id },
    });
    if (!healthInsurance)
      throw new NotFoundException(`Seguro de salud con ID ${id} no encontrado`);
    return healthInsurance;
  }

  async update(
    id: number,
    updateHealthInsuranceDto: UpdateHealthInsuranceDto,
  ): Promise<HealthInsurance> {
    const healthInsurance = await this.findOne(id);
    if (
      updateHealthInsuranceDto.name &&
      updateHealthInsuranceDto.name !== healthInsurance.name
    ) {
      const existing = await this.healthInsuranceRepository.findOne({
        where: { name: updateHealthInsuranceDto.name },
      });
      if (existing)
        throw new ConflictException(
          `Ya existe un seguro de salud con el nombre "${updateHealthInsuranceDto.name}"`,
        );
    }
    Object.assign(healthInsurance, updateHealthInsuranceDto);
    const updated = await this.healthInsuranceRepository.save(healthInsurance);
    this.logger.log(
      `Seguro de salud actualizado: ${updated.id} - ${updated.name}`,
    );
    return updated;
  }

  async remove(id: number): Promise<{ message: string }> {
    const healthInsurance = await this.findOne(id);
    healthInsurance.isActive = false;
    await this.healthInsuranceRepository.save(healthInsurance);
    this.logger.log(
      `Seguro de salud desactivado: ${healthInsurance.id} - ${healthInsurance.name}`,
    );
    return {
      message: `Seguro de salud "${healthInsurance.name}" desactivado exitosamente`,
    };
  }

  async activate(id: number): Promise<HealthInsurance> {
    const healthInsurance = await this.findOne(id);
    healthInsurance.isActive = true;
    const activated =
      await this.healthInsuranceRepository.save(healthInsurance);
    this.logger.log(
      `Seguro de salud activado: ${activated.id} - ${activated.name}`,
    );
    return activated;
  }
}
