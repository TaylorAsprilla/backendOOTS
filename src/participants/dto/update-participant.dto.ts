import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipantDto } from './create-participant.dto';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { IdentifiedSituation } from '../../common/enums';

export class UpdateParticipantDto extends PartialType(CreateParticipantDto) {}

// DTO para consultas de búsqueda
export class SearchParticipantsDto {
  @IsOptional()
  @IsString()
  q?: string; // Búsqueda general por nombre, documento, teléfono

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(IdentifiedSituation, { each: true })
  situations?: IdentifiedSituation[];

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
