import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateIncomeSourceDto {
  @ApiProperty({
    example: 'Empleo Formal',
    description: 'Nombre de la fuente de ingreso',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la fuente de ingreso está activa',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
