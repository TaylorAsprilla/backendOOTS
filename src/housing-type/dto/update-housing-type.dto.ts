import { PartialType } from '@nestjs/swagger';
import { CreateHousingTypeDto } from './create-housing-type.dto';

export class UpdateHousingTypeDto extends PartialType(CreateHousingTypeDto) {}
