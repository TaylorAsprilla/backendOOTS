import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FinalizeCaseDiscussionDto {
  @ApiProperty({
    description: 'Recomendaciones del trabajador social al finalizar la discusión',
    example: 'Continuar visitas domiciliarias quincenales y monitoreo clínico.',
  })
  @IsString()
  @IsNotEmpty()
  socialWorkerRecommendations!: string;

  @ApiProperty({
    description: 'Recomendaciones del supervisor al finalizar la discusión',
    example: 'Escalar a mesa interdisciplinaria y reforzar plan de seguridad.',
  })
  @IsString()
  @IsNotEmpty()
  supervisorRecommendations!: string;

  @ApiPropertyOptional({
    description: 'Personas más afectadas por la situación',
    example: 'Hija menor, madre y cuidadora principal.',
  })
  @IsOptional()
  @IsString()
  affectedPeople?: string;
}