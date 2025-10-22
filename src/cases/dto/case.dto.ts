import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsArray,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from '../../common/enums';

// DTOs para las entidades médicas relacionadas con Case
export class CreateBioPsychosocialHistoryDto {
  @IsOptional()
  @IsString()
  completedGrade?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  occupationalHistory?: string;

  @IsOptional()
  @IsNumber()
  housingTypeId?: number;

  @IsOptional()
  @IsNumber()
  educationLevelId?: number;

  @IsOptional()
  @IsNumber()
  incomeSourceId?: number;

  @IsOptional()
  @IsNumber()
  incomeLevelId?: number;

  @IsOptional()
  @IsString()
  housing?: string;
}

export class CreateConsultationReasonDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class CreateInterventionDto {
  @IsString()
  @IsNotEmpty()
  intervention!: string;
}

export class CreateFollowUpPlanDto {
  @IsString()
  @IsNotEmpty()
  plan!: string;
}

export class CreatePhysicalHealthHistoryDto {
  @IsOptional()
  @IsString()
  physicalConditions?: string;

  @IsOptional()
  @IsBoolean()
  receivingTreatment?: boolean;

  @IsOptional()
  @IsString()
  treatmentDetails?: string;

  @IsOptional()
  @IsString()
  paternalFamilyHistory?: string;

  @IsOptional()
  @IsString()
  maternalFamilyHistory?: string;

  @IsOptional()
  @IsString()
  physicalHealthObservations?: string;
}

export class CreateMentalHealthHistoryDto {
  @IsOptional()
  @IsString()
  mentalConditions?: string;

  @IsOptional()
  @IsBoolean()
  receivingMentalTreatment?: boolean;

  @IsOptional()
  @IsString()
  mentalTreatmentDetails?: string;

  @IsOptional()
  @IsString()
  paternalMentalHistory?: string;

  @IsOptional()
  @IsString()
  maternalMentalHistory?: string;

  @IsOptional()
  @IsString()
  mentalHealthObservations?: string;
}

export class CreateAssessmentDto {
  @IsOptional()
  @IsString()
  consultationReason?: string;

  @IsOptional()
  @IsString()
  weighting?: string;

  @IsOptional()
  @IsString()
  concurrentFactors?: string;

  @IsOptional()
  @IsString()
  criticalFactors?: string;

  @IsOptional()
  @IsString()
  problemAnalysis?: string;
}

export class CreateInterventionPlanDto {
  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsString()
  activities?: string;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsString()
  responsiblePerson?: string;

  @IsOptional()
  @IsString()
  evaluationCriteria?: string;
}

export class CreateProgressNoteDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  approachType!: string;

  @IsString()
  @IsNotEmpty()
  process!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  agreements?: string;
}

export class CreateReferralsDto {
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCaseDto {
  // INFORMACIÓN BÁSICA DEL CASO
  @ApiProperty({
    description: 'Título breve del caso',
    example: 'Consulta por ansiedad post-separación',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Descripción detallada del caso',
    example:
      'Paciente presenta síntomas de ansiedad y dificultades para conciliar el sueño tras separación matrimonial reciente. Requiere acompañamiento psicológico y orientación espiritual.',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description!: string;

  @ApiProperty({
    description: 'ID del participante para quien se crea el caso',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  participantId!: number;

  // INFORMACIÓN MÉDICA/CLÍNICA DEL CASO
  @ApiProperty({
    description: 'Historia biopsicosocial del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBioPsychosocialHistoryDto)
  bioPsychosocialHistory?: CreateBioPsychosocialHistoryDto;

  @ApiProperty({
    description: 'Motivo de consulta del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateConsultationReasonDto)
  consultationReason?: CreateConsultationReasonDto;

  @ApiProperty({
    description: 'Intervención inicial del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateInterventionDto)
  intervention?: CreateInterventionDto;

  @ApiProperty({
    description: 'Plan de seguimiento del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateFollowUpPlanDto)
  followUpPlan?: CreateFollowUpPlanDto;

  @ApiProperty({
    description: 'Historia de salud física del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePhysicalHealthHistoryDto)
  physicalHealthHistory?: CreatePhysicalHealthHistoryDto;

  @ApiProperty({
    description: 'Historia de salud mental del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateMentalHealthHistoryDto)
  mentalHealthHistory?: CreateMentalHealthHistoryDto;

  @ApiProperty({
    description: 'Evaluación del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAssessmentDto)
  assessment?: CreateAssessmentDto;

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

  @ApiProperty({
    description: 'Referencias del caso',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateReferralsDto)
  referrals?: CreateReferralsDto;
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
