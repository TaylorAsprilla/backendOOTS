import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeighingDto {
  @ApiProperty({
    description: 'Motivo de consulta según el trabajador social',
    example:
      'Paciente refiere estrés laboral crónico con impacto en su vida familiar',
    required: false,
  })
  @IsString()
  @IsOptional()
  reasonConsultation?: string;

  @ApiProperty({
    description: 'Situación identificada por el trabajador social',
    example:
      'Se identifica cuadro de ansiedad generalizada con síntomas somáticos',
    required: false,
  })
  @IsString()
  @IsOptional()
  identifiedSituation?: string;

  @ApiProperty({
    description: 'Condiciones favorables del paciente',
    example:
      'Cuenta con red de apoyo familiar, empleo estable, acceso a servicios de salud',
    required: false,
  })
  @IsString()
  @IsOptional()
  favorableConditions?: string;

  @ApiProperty({
    description: 'Condiciones no favorables del paciente',
    example:
      'Alto nivel de responsabilidades laborales, escasa red de apoyo social fuera del núcleo familiar',
    required: false,
  })
  @IsString()
  @IsOptional()
  conditionsNotFavorable?: string;

  @ApiProperty({
    description: 'Proceso de ayuda recomendado',
    example:
      'Se recomienda iniciar proceso de orientación psicológica con enfoque cognitivo-conductual, 8 sesiones',
    required: false,
  })
  @IsString()
  @IsOptional()
  helpProcess?: string;
}
