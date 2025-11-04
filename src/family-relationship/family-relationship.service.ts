import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateFamilyRelationshipDto,
  UpdateFamilyRelationshipDto,
} from './dto';
import { FamilyRelationship } from './entities/family-relationship.entity';

@Injectable()
export class FamilyRelationshipService {
  private readonly logger = new Logger(FamilyRelationshipService.name);

  constructor(
    @InjectRepository(FamilyRelationship)
    private readonly familyRelationshipRepository: Repository<FamilyRelationship>,
  ) {}

  async create(
    createDto: CreateFamilyRelationshipDto,
  ): Promise<FamilyRelationship> {
    const existing = await this.familyRelationshipRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing)
      throw new ConflictException(
        `El parentesco "${createDto.name}" ya existe`,
      );
    const familyRelationship =
      this.familyRelationshipRepository.create(createDto);
    const saved =
      await this.familyRelationshipRepository.save(familyRelationship);
    this.logger.log(`Parentesco creado: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<FamilyRelationship[]> {
    return this.familyRelationshipRepository.find({ order: { name: 'ASC' } });
  }

  async findActive(): Promise<FamilyRelationship[]> {
    return this.familyRelationshipRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<FamilyRelationship> {
    const familyRelationship = await this.familyRelationshipRepository.findOne({
      where: { id },
    });
    if (!familyRelationship)
      throw new NotFoundException(`Parentesco con ID ${id} no encontrado`);
    return familyRelationship;
  }

  async update(
    id: number,
    updateDto: UpdateFamilyRelationshipDto,
  ): Promise<FamilyRelationship> {
    const familyRelationship = await this.findOne(id);
    if (updateDto.name && updateDto.name !== familyRelationship.name) {
      const existing = await this.familyRelationshipRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing)
        throw new ConflictException(
          `El parentesco "${updateDto.name}" ya existe`,
        );
    }
    Object.assign(familyRelationship, updateDto);
    const updated =
      await this.familyRelationshipRepository.save(familyRelationship);
    this.logger.log(`Parentesco actualizado: ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const familyRelationship = await this.findOne(id);
    familyRelationship.isActive = false;
    await this.familyRelationshipRepository.save(familyRelationship);
    this.logger.log(`Parentesco desactivado: ${id}`);
  }

  async activate(id: number): Promise<FamilyRelationship> {
    const familyRelationship = await this.findOne(id);
    familyRelationship.isActive = true;
    const activated =
      await this.familyRelationshipRepository.save(familyRelationship);
    this.logger.log(`Parentesco activado: ${id}`);
    return activated;
  }
}
