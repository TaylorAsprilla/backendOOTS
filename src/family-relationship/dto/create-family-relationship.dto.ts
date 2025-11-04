import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFamilyRelationshipDto {
  @ApiProperty({
    example: 'Madre',
    description: 'Nombre del parentesco familiar',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el parentesco está activo',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
