import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGenderDto {
  @ApiProperty({
    description: 'Nombre del género',
    example: 'Masculino',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    description: 'Estado activo del género',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
