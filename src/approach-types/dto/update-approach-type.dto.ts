import { PartialType } from '@nestjs/swagger';
import { CreateApproachTypeDto } from './create-approach-type.dto';

export class UpdateApproachTypeDto extends PartialType(CreateApproachTypeDto) {}
