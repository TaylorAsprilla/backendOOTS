import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateIncomeLevelDto {
  @ApiProperty({ example: 'Medio', description: 'Nombre del nivel de ingreso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el nivel de ingreso está activo',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
