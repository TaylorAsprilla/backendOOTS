import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlanCatalog } from '../follow-up-plan-catalog/entities/follow-up-plan-catalog.entity';

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
      order: { id: 'ASC', name: 'ASC' },
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
