import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProcessTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de proceso',
    example: 'Proceso Individual',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del tipo de proceso',
    example: 'Proceso terapéutico enfocado en atención individual',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
