import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApproachTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de abordaje',
    example: 'Terapia Cognitivo-Conductual',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del tipo de abordaje',
    example:
      'Enfoque terapéutico que trabaja modificando pensamientos y conductas',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
