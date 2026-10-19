import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateParticipantDto } from './create-participant.dto';

export class UpdateParticipantDto extends PartialType(
  OmitType(
    CreateParticipantDto,
    ['registeredById', 'secondName', 'secondLastName'] as const,
  ),
) {
  @IsOptional()
  @IsString()
  secondName?: string | null;

  @IsOptional()
  @IsString()
  secondLastName?: string | null;
}
