import { PartialType } from '@nestjs/swagger';
import { CreateApproachTypeDto } from './create-approach-type.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApproachTypeDto extends PartialType(CreateApproachTypeDto) {
  @ApiProperty({
    description: 'Estado activo/inactivo del tipo de abordaje',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
