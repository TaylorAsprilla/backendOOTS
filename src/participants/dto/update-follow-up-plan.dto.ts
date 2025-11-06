import { PartialType } from '@nestjs/swagger';
import { CreateFollowUpPlanDto } from './create-follow-up-plan.dto';

export class UpdateFollowUpPlanDto extends PartialType(CreateFollowUpPlanDto) {}
