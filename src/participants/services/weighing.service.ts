import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Weighing } from '../entities/weighing.entity';
import { CreateWeighingDto } from '../dto/create-weighing.dto';
import { UpdateWeighingDto } from '../dto/update-weighing.dto';

@Injectable()
export class WeighingService {
  constructor(
    @InjectRepository(Weighing)
    private weighingRepository: Repository<Weighing>,
  ) {}

  async create(
    caseId: number,
    createWeighingDto: CreateWeighingDto,
  ): Promise<Weighing> {
    // Verificar si ya existe un weighing para este caso
    const existingWeighing = await this.weighingRepository.findOne({
      where: { caseId },
    });

    if (existingWeighing) {
      throw new ConflictException(
        `Ya existe una ponderación para el caso con ID ${caseId}`,
      );
    }

    const weighing = this.weighingRepository.create({
      ...createWeighingDto,
      caseId,
    });

    return await this.weighingRepository.save(weighing);
  }

  async findAll(): Promise<Weighing[]> {
    return await this.weighingRepository.find({
      relations: ['case'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Weighing> {
    const weighing = await this.weighingRepository.findOne({
      where: { id },
      relations: ['case'],
    });

    if (!weighing) {
      throw new NotFoundException(`Weighing with ID ${id} not found`);
    }

    return weighing;
  }

  async findByCaseId(caseId: number): Promise<Weighing | null> {
    return await this.weighingRepository.findOne({
      where: { caseId },
      relations: ['case'],
    });
  }

  async update(
    id: number,
    updateWeighingDto: UpdateWeighingDto,
  ): Promise<Weighing> {
    const weighing = await this.findOne(id);

    Object.assign(weighing, updateWeighingDto);

    return await this.weighingRepository.save(weighing);
  }

  async remove(id: number): Promise<void> {
    const weighing = await this.findOne(id);
    await this.weighingRepository.remove(weighing);
  }
}
