import { PartialType } from '@nestjs/swagger';
import { CreateIncomeLevelDto } from './create-income-level.dto';

export class UpdateIncomeLevelDto extends PartialType(CreateIncomeLevelDto) {}
