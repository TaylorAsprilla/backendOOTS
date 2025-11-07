import { PartialType } from '@nestjs/swagger';
import { CreateTypeProgressDto } from './create-type-progress.dto';

export class UpdateTypeProgressDto extends PartialType(CreateTypeProgressDto) {}
