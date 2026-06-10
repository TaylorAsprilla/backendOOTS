import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CaseDiscussionFamilyMemberDto } from './case-discussion-family-member.dto';

export class CreateCaseDiscussionDto {
  @ApiProperty({
    description: 'Participante asociado al caso. Debe coincidir con el participante del caso.',
    example: 12,
  })
  @IsInt()
  participantId!: number;

  @ApiProperty({
    description: 'Supervisor asignado a la discusión',
    example: 7,
  })
  @IsInt()
  supervisorId!: number;

  @ApiProperty({
    description: 'Fecha en la que se realizó la discusión',
    example: '2026-06-05',
  })
  @IsDateString()
  discussionDate!: string;

  @ApiProperty({
    description: 'Situaciones que presenta el cliente',
    example:
      'Conflicto familiar persistente, desregulación emocional y dificultades económicas recientes.',
  })
  @IsString()
  @IsNotEmpty()
  presentedSituations!: string;

  @ApiPropertyOptional({
    description: 'Personas más afectadas por la situación',
    example: 'Madre, hija adolescente y red de apoyo inmediata.',
  })
  @IsOptional()
  @IsString()
  affectedPeople?: string;

  @ApiPropertyOptional({
    description: 'Recomendaciones del trabajador social o manejador del caso',
    example: 'Mantener seguimiento semanal y activar red interagencial.',
  })
  @IsOptional()
  @IsString()
  socialWorkerRecommendations?: string;

  @ApiPropertyOptional({
    description: 'Recomendaciones del supervisor',
    example: 'Documentar factores de riesgo y coordinar intervención familiar.',
  })
  @IsOptional()
  @IsString()
  supervisorRecommendations?: string;

  @ApiPropertyOptional({
    description:
      'Composición familiar asociada a la discusión. Si se omite, el servicio toma snapshot de los familiares del caso.',
    type: [CaseDiscussionFamilyMemberDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaseDiscussionFamilyMemberDto)
  familyMembers?: CaseDiscussionFamilyMemberDto[];
}