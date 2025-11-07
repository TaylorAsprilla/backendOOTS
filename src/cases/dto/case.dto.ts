import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from '../../common/enums';
import { CreateFollowUpPlanDto } from '../../participants/dto/create-follow-up-plan.dto';

// DTOs para las entidades médicas relacionadas con Case
export class CreatePhysicalHealthHistoryDto {
  @ApiProperty({
    description: 'Condiciones médicas actuales que presenta el participante',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentConditions?: string;

  @ApiProperty({
    description: 'Medicamentos que toma actualmente',
    required: false,
  })
  @IsOptional()
  @IsString()
  medications?: string;

  @ApiProperty({
    description: 'Antecedentes familiares del padre',
    required: false,
  })
  @IsOptional()
  @IsString()
  familyHistoryFather?: string;

  @ApiProperty({
    description: 'Antecedentes familiares de la madre',
    required: false,
  })
  @IsOptional()
  @IsString()
  familyHistoryMother?: string;

  @ApiProperty({
    description: 'Observaciones sobre salud física',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateMentalHealthHistoryDto {
  @ApiProperty({
    description: 'Condiciones mentales actuales que presenta el participante',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentConditions?: string;

  @ApiProperty({
    description: 'Medicamentos que toma actualmente',
    required: false,
  })
  @IsOptional()
  @IsString()
  medications?: string;

  @ApiProperty({
    description: 'Antecedentes familiares del padre',
    required: false,
  })
  @IsOptional()
  @IsString()
  familyHistoryFather?: string;

  @ApiProperty({
    description: 'Antecedentes familiares de la madre',
    required: false,
  })
  @IsOptional()
  @IsString()
  familyHistoryMother?: string;

  @ApiProperty({
    description: 'Observaciones sobre salud mental',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateInterventionPlanDto {
  @ApiProperty({
    description: 'Meta del plan de intervención',
    required: false,
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({
    description: 'Objetivos específicos a lograr con este plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiProperty({
    description: 'Actividades concretas a realizar',
    required: false,
  })
  @IsOptional()
  @IsString()
  activities?: string;

  @ApiProperty({
    description: 'Tiempo estimado para completar este plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiProperty({
    description: 'Profesional responsable de ejecutar el plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  responsible?: string;

  @ApiProperty({
    description: 'Criterios de evaluación',
    required: false,
  })
  @IsOptional()
  @IsString()
  evaluationCriteria?: string;
}

export class CreateProgressNoteDto {
  @ApiProperty({
    description: 'Fecha en que se realizó la sesión',
    example: '2024-03-01',
  })
  @IsDateString()
  sessionDate!: string;

  @ApiProperty({
    description: 'Tipo de sesión: INDIVIDUAL, GRUPAL, FAMILIAR, EVALUACION',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionType?: string;

  @ApiProperty({
    description: 'Resumen de la sesión',
    required: false,
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    description: 'Observaciones adicionales relevantes',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    description: 'Acuerdos tomados',
    required: false,
  })
  @IsOptional()
  @IsString()
  agreements?: string;
}

export class CreateWeighingDto {
  @ApiProperty({
    description: 'Motivo de consulta para la ponderación',
    required: false,
  })
  @IsOptional()
  @IsString()
  reasonConsultation?: string;

  @ApiProperty({
    description: 'Situación identificada',
    required: false,
  })
  @IsOptional()
  @IsString()
  identifiedSituation?: string;

  @ApiProperty({
    description: 'Condiciones favorables',
    required: false,
  })
  @IsOptional()
  @IsString()
  favorableConditions?: string;

  @ApiProperty({
    description: 'Condiciones no favorables',
    required: false,
  })
  @IsOptional()
  @IsString()
  conditionsNotFavorable?: string;

  @ApiProperty({
    description: 'Proceso de ayuda',
    required: false,
  })
  @IsOptional()
  @IsString()
  helpProcess?: string;
}

export class CreateClosingNoteDto {
  @ApiProperty({
    description: 'Fecha en que se cierra el caso',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @ApiProperty({
    description:
      'Razón del cierre: TREATMENT_COMPLETED, PARTICIPANT_WITHDRAWAL, TRANSFER, NO_SHOW, OTHER',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Logros alcanzados durante el tratamiento',
    required: false,
  })
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiProperty({
    description: 'Recomendaciones para el participante post-cierre',
    required: false,
  })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiProperty({
    description: 'Observaciones finales sobre el caso',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateCaseDto {
  // 1. INFORMACIÓN BÁSICA DEL CASO (id, caseNumber, status, participantId, createdAt/updatedAt se manejan automáticamente)
  @ApiProperty({
    description: 'ID del participante para quien se crea el caso',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  participantId!: number;

  // 2. MOTIVO DE LA CONSULTA - ahora es string simple
  @ApiProperty({
    description: 'Motivo de consulta del caso',
    required: false,
    example:
      'El participante presenta síntomas de ansiedad y estrés post-separación matrimonial',
  })
  @IsOptional()
  @IsString()
  consultationReason?: string;

  // 3. SITUACIONES IDENTIFICADAS
  @ApiProperty({
    description: 'IDs de situaciones identificadas del catálogo',
    required: false,
    type: [Number],
    example: [1, 3, 5, 8],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  identifiedSituations?: number[];

  // 4. INTERVENCIÓN INICIAL - ahora es string simple
  @ApiProperty({
    description: 'Intervención inicial del caso',
    required: false,
    example:
      'Se evidencia sintomatología ansiosa moderada con afectación del sueño y concentración',
  })
  @IsOptional()
  @IsString()
  intervention?: string;

  // 5. PLAN DE SEGUIMIENTO - array de objetos FollowUpPlan
  @ApiProperty({
    description: 'Planes de seguimiento del caso',
    required: false,
    type: [Object],
    example: [
      {
        processCompleted: false,
        coordinatedService: 'Terapia psicológica',
        referred: false,
        orientationAppointment: true,
        appointmentDate: '2025-11-10',
        appointmentTime: '14:30:00',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFollowUpPlanDto)
  followUpPlan?: CreateFollowUpPlanDto[];

  // 6. HISTORIA DE SALUD FÍSICA - ahora es array
  @ApiProperty({
    description: 'Historias de salud física del caso (array)',
    required: false,
    type: [CreatePhysicalHealthHistoryDto],
    example: [
      {
        currentConditions: 'Diabetes tipo 2',
        medications: 'Metformina 500mg',
        familyHistoryFather: 'Hipertensión',
        familyHistoryMother: 'Diabetes',
        observations: 'Control cada 3 meses',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhysicalHealthHistoryDto)
  physicalHealthHistory?: CreatePhysicalHealthHistoryDto[];

  // 7. HISTORIA DE SALUD MENTAL - ahora es array
  @ApiProperty({
    description: 'Historias de salud mental del caso (array)',
    required: false,
    type: [CreateMentalHealthHistoryDto],
    example: [
      {
        currentConditions: 'Ansiedad generalizada',
        medications: 'Sertralina 50mg',
        familyHistoryFather: 'Depresión',
        familyHistoryMother: 'Ninguna',
        observations: 'Seguimiento psicológico mensual',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMentalHealthHistoryDto)
  mentalHealthHistory?: CreateMentalHealthHistoryDto[];

  // 8. PONDERACIÓN (WEIGHING)
  @ApiProperty({
    description: 'Ponderación del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateWeighingDto)
  weighing?: CreateWeighingDto;

  // 9. PLANES DE INTERVENCIÓN DETALLADOS
  @ApiProperty({
    description: 'Planes de intervención del caso',
    required: false,
    type: [CreateInterventionPlanDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInterventionPlanDto)
  interventionPlans?: CreateInterventionPlanDto[];

  // 10. NOTAS DE PROGRESO
  @ApiProperty({
    description: 'Notas de progreso del caso',
    required: false,
    type: [CreateProgressNoteDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgressNoteDto)
  progressNotes?: CreateProgressNoteDto[];

  // 11. REFERIDOS - ahora es string simple
  @ApiProperty({
    description: 'Referidos del caso con justificación',
    required: false,
    example:
      'Considerar evaluación si persiste alteración del sueño después de 4 semanas de terapia',
  })
  @IsOptional()
  @IsString()
  referrals?: string;

  // 12. NOTA DE CIERRE
  @ApiProperty({
    description: 'Nota de cierre del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateClosingNoteDto)
  closingNote?: CreateClosingNoteDto;
}

export class UpdateCaseStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del caso',
    enum: CaseStatus,
    example: CaseStatus.IN_PROGRESS,
  })
  @IsEnum(CaseStatus)
  @IsNotEmpty()
  status!: CaseStatus;
}

export class CaseResponseDto {
  @ApiProperty({ description: 'ID único del caso', example: 1 })
  id: number;

  @ApiProperty({ description: 'Número único del caso', example: 'CASE-0001' })
  caseNumber: string;

  @ApiProperty({
    description: 'Título del caso',
    example: 'Consulta por ansiedad post-separación',
  })
  title: string;

  @ApiProperty({ description: 'Descripción del caso' })
  description: string;

  @ApiProperty({ description: 'Estado del caso', enum: CaseStatus })
  status: CaseStatus;

  @ApiProperty({ description: 'ID del participante', example: 1 })
  participantId: number;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
