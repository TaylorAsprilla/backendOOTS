import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeProgress } from './entities/type-progress.entity';
import { CreateTypeProgressDto } from './dto/create-type-progress.dto';
import { UpdateTypeProgressDto } from './dto/update-type-progress.dto';

@Injectable()
export class TypeProgressService {
  constructor(
    @InjectRepository(TypeProgress)
    private readonly typeProgressRepository: Repository<TypeProgress>,
  ) {}

  async create(
    createTypeProgressDto: CreateTypeProgressDto,
  ): Promise<TypeProgress> {
    const typeProgress = this.typeProgressRepository.create(
      createTypeProgressDto,
    );
    return await this.typeProgressRepository.save(typeProgress);
  }

  async findAll(): Promise<TypeProgress[]> {
    return await this.typeProgressRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findAllWithInactive(): Promise<TypeProgress[]> {
    return await this.typeProgressRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TypeProgress> {
    const typeProgress = await this.typeProgressRepository.findOne({
      where: { id },
    });

    if (!typeProgress) {
      throw new NotFoundException(`TypeProgress with ID ${id} not found`);
    }

    return typeProgress;
  }

  async update(
    id: number,
    updateTypeProgressDto: UpdateTypeProgressDto,
  ): Promise<TypeProgress> {
    const typeProgress = await this.findOne(id);
    Object.assign(typeProgress, updateTypeProgressDto);
    return await this.typeProgressRepository.save(typeProgress);
  }

  async remove(id: number): Promise<void> {
    const typeProgress = await this.findOne(id);
    typeProgress.isActive = false;
    await this.typeProgressRepository.save(typeProgress);
  }

  async activate(id: number): Promise<TypeProgress> {
    const typeProgress = await this.findOne(id);
    typeProgress.isActive = true;
    return await this.typeProgressRepository.save(typeProgress);
  }

  async hardDelete(id: number): Promise<void> {
    const typeProgress = await this.findOne(id);
    await this.typeProgressRepository.remove(typeProgress);
  }
}
