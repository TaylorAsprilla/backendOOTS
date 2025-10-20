import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsPositive,
} from 'class-validator';
import {
  DocumentType,
  Gender,
  MaritalStatus,
  HealthInsurance,
  EmergencyContactRelationship,
  FamilyRelationship,
  AcademicLevel,
  EducationLevel,
  IncomeSource,
  IncomeLevel,
  HousingType,
  IdentifiedSituation,
  FollowUpPlanType,
  TreatmentStatus,
  ApproachType,
  ProcessType,
} from '../../common/enums';

// DTO para miembros de la familia
export class CreateFamilyMemberDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsEnum(FamilyRelationship)
  relationshipId: FamilyRelationship;

  @IsOptional()
  @IsEnum(AcademicLevel)
  academicLevelId?: AcademicLevel;
}

// DTO para historial bio-psicosocial
export class CreateBioPsychosocialHistoryDto {
  @IsOptional()
  @IsEnum(EducationLevel)
  schooling?: EducationLevel;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  completedGrade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @IsOptional()
  @IsEnum(IncomeSource)
  incomeSource?: IncomeSource;

  @IsOptional()
  @IsEnum(IncomeLevel)
  incomeLevel?: IncomeLevel;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  occupationalHistory?: string;

  @IsEnum(HousingType)
  housingTypeId: HousingType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  housing?: string;
}

// DTO para motivo de consulta
export class CreateConsultationReasonDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

// DTO para intervención
export class CreateInterventionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  intervention?: string;
}

// DTO para plan de seguimiento
export class CreateFollowUpPlanDto {
  @IsEnum(FollowUpPlanType)
  plan: FollowUpPlanType;
}

// DTO para historial de salud física
export class CreatePhysicalHealthHistoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  physicalConditions?: string;

  @IsOptional()
  @IsEnum(TreatmentStatus)
  receivingTreatment?: TreatmentStatus;

  @IsOptional()
  @IsString()
  treatmentDetails?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paternalFamilyHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  maternalFamilyHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  physicalHealthObservations?: string;
}

// DTO para historial de salud mental
export class CreateMentalHealthHistoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mentalConditions?: string;

  @IsOptional()
  @IsEnum(TreatmentStatus)
  receivingMentalTreatment?: TreatmentStatus;

  @IsOptional()
  @IsString()
  mentalTreatmentDetails?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paternalMentalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  maternalMentalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mentalHealthObservations?: string;
}

// DTO para ponderación
export class CreateAssessmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  consultationReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  weighting?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  concurrentFactors?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  criticalFactors?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  problemAnalysis?: string;
}

// DTO para plan de intervención
export class CreateInterventionPlanDto {
  @IsString()
  @MaxLength(500)
  goal: string;

  @IsString()
  @MaxLength(500)
  objectives: string;

  @IsString()
  @MaxLength(1000)
  activities: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timeframe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  responsiblePerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  evaluationCriteria?: string;
}

// DTO para notas de progreso
export class CreateProgressNoteDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  time?: string;

  @IsEnum(ApproachType)
  approachType: ApproachType;

  @IsEnum(ProcessType)
  process: ProcessType;

  @IsString()
  @MaxLength(2000)
  summary: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  agreements?: string;
}

// DTO para referidos
export class CreateReferralsDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

// DTO para nota de cierre
export class CreateClosingNoteDto {
  @IsString()
  @MaxLength(2000)
  closureReason: string;

  @IsString()
  @MaxLength(2000)
  achievements: string;

  @IsString()
  @MaxLength(2000)
  recommendations: string;

  @IsString()
  @MaxLength(2000)
  observations: string;
}

// DTO principal para crear participante
export class CreateParticipantDto {
  // DATOS PERSONALES
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstLastName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondLastName?: string;

  @IsString()
  @Matches(/^\+57 3\d{2} \d{3} \d{4}$/, {
    message: 'Phone number must be in format: +57 3XX XXX XXXX',
  })
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(DocumentType)
  documentTypeId: DocumentType;

  @IsString()
  documentNumber: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  address: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  city: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  religiousAffiliation: string;

  @IsEnum(Gender)
  genderId: Gender;

  @IsEnum(MaritalStatus)
  maritalStatusId: MaritalStatus;

  @IsEnum(HealthInsurance)
  healthInsuranceId: HealthInsurance;

  @IsOptional()
  @IsString()
  customHealthInsurance?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  referralSource?: string;

  // CONTACTO DE EMERGENCIA
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  emergencyContactName: string;

  @IsString()
  @Matches(/^\+57 3\d{2} \d{3} \d{4}$/, {
    message: 'Emergency contact phone must be in format: +57 3XX XXX XXXX',
  })
  emergencyContactPhone: string;

  @IsEmail()
  emergencyContactEmail: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  emergencyContactAddress: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  emergencyContactCity: string;

  @IsEnum(EmergencyContactRelationship)
  emergencyContactRelationship: EmergencyContactRelationship;

  // SECCIONES OPCIONALES
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberDto)
  @ArrayMinSize(1, { message: 'At least one family member is required' })
  familyMembers?: CreateFamilyMemberDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBioPsychosocialHistoryDto)
  bioPsychosocialHistory?: CreateBioPsychosocialHistoryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateConsultationReasonDto)
  consultationReason?: CreateConsultationReasonDto;

  @IsOptional()
  @IsArray()
  @IsEnum(IdentifiedSituation, { each: true })
  identifiedSituations?: IdentifiedSituation[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInterventionDto)
  intervention?: CreateInterventionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateFollowUpPlanDto)
  followUpPlan?: CreateFollowUpPlanDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePhysicalHealthHistoryDto)
  physicalHealthHistory?: CreatePhysicalHealthHistoryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMentalHealthHistoryDto)
  mentalHealthHistory?: CreateMentalHealthHistoryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAssessmentDto)
  assessment?: CreateAssessmentDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInterventionPlanDto)
  interventionPlans?: CreateInterventionPlanDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgressNoteDto)
  progressNotes?: CreateProgressNoteDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateReferralsDto)
  referrals?: CreateReferralsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClosingNoteDto)
  closingNote?: CreateClosingNoteDto;
}

// DTOs para actualizaciones por sección
export class UpdateFamilyMemberDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  id?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsEnum(FamilyRelationship)
  relationshipId?: FamilyRelationship;

  @IsOptional()
  @IsEnum(AcademicLevel)
  academicLevelId?: AcademicLevel;
}

export class UpdateProgressNoteDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  id?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  time?: string;

  @IsOptional()
  @IsEnum(ApproachType)
  approachType?: ApproachType;

  @IsOptional()
  @IsEnum(ProcessType)
  process?: ProcessType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  agreements?: string;
}

export class UpdateInterventionPlanDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  goal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  objectives?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  activities?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timeframe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  responsiblePerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  evaluationCriteria?: string;
}
