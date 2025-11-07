import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeProgressDto {
  @ApiProperty({
    description: 'Nombre del tipo de progreso',
    example: 'Consulta Presencial',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Código único del tipo de progreso',
    example: 'CP',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Descripción del tipo de progreso',
    required: false,
    example: 'Atención presencial en las instalaciones',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indica si el tipo de progreso está activo',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
