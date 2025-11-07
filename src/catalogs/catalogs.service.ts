import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(IdentifiedSituation)
    private readonly identifiedSituationRepository: Repository<IdentifiedSituation>,
    @InjectRepository(FollowUpPlan)
    private readonly followUpPlanRepository: Repository<FollowUpPlan>,
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

  async findAllFollowUpPlans(): Promise<FollowUpPlan[]> {
    return await this.followUpPlanRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findFollowUpPlanById(id: number): Promise<FollowUpPlan | null> {
    return await this.followUpPlanRepository.findOne({
      where: { id },
    });
  }
}
