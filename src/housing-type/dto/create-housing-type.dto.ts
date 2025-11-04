import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateHousingTypeDto {
  @ApiProperty({
    example: 'Casa Propia',
    description: 'Nombre del tipo de vivienda',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el tipo de vivienda está activo',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
