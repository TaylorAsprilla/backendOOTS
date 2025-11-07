import {
  IsBoolean,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowUpPlanDto {
  @ApiProperty({
    description: 'ID del caso al que pertenece este plan de seguimiento',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  caseId?: number;

  @ApiProperty({
    description: 'Indica si el proceso ha sido completado',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  processCompleted?: boolean;

  @ApiProperty({
    description: 'Indica si se coordinó algún servicio',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  coordinatedService?: boolean;

  @ApiProperty({
    description: 'Indica si fue referido a otra institución',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  referred?: boolean;

  @ApiProperty({
    description: 'Detalles de la referencia',
    required: false,
  })
  @IsOptional()
  @IsString()
  referralDetails?: string;

  @ApiProperty({
    description: 'Indica si se programó cita de orientación',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  orientationAppointment?: boolean;

  @ApiProperty({
    description: 'Fecha de la cita programada',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({
    description: 'Hora de la cita programada',
    required: false,
  })
  @IsOptional()
  @IsString()
  appointmentTime?: string;

  @ApiProperty({
    description: 'Otros detalles del plan de seguimiento',
    required: false,
  })
  @IsOptional()
  @IsString()
  otherDetails?: string;
}
