import { PartialType } from '@nestjs/swagger';
import { CreateProcessTypeDto } from './create-process-type.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProcessTypeDto extends PartialType(CreateProcessTypeDto) {
  @ApiProperty({
    description: 'Estado activo/inactivo del tipo de proceso',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
