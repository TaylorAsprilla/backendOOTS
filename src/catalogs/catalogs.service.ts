import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentifiedSituation } from '../common/entities';
import { FollowUpPlanCatalog } from '../common/entities/follow-up-plan-catalog.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(IdentifiedSituation)
    private readonly identifiedSituationRepository: Repository<IdentifiedSituation>,
    @InjectRepository(FollowUpPlanCatalog)
    private readonly followUpPlanRepository: Repository<FollowUpPlanCatalog>,
  ) {}

  async findAllIdentifiedSituations(): Promise<IdentifiedSituation[]> {
    return await this.identifiedSituationRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findIdentifiedSituationById(
    id: number,
  ): Promise<IdentifiedSituation | null> {
    return await this.identifiedSituationRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async findAllFollowUpPlans(): Promise<FollowUpPlanCatalog[]> {
    return await this.followUpPlanRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findFollowUpPlanById(id: number): Promise<FollowUpPlanCatalog | null> {
    return await this.followUpPlanRepository.findOne({
      where: { id, isActive: true },
    });
  }
}
