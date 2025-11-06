import { PartialType } from '@nestjs/swagger';
import { CreateIdentifiedSituationDto } from './create-identified-situation.dto';

export class UpdateIdentifiedSituationDto extends PartialType(
  CreateIdentifiedSituationDto,
) {}
