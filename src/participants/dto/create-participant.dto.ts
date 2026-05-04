import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// DTOs para las relaciones anidadas (definidas primero)
export class CreateEmergencyContactDto {
  @ApiProperty({
    description: 'Nombre completo del contacto de emergencia',
    example: 'Carlos Alberto González Martínez',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Teléfono del contacto de emergencia',
    example: '+57 301 987 6543',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Email del contacto de emergencia',
    example: 'carlos.gonzalez@email.com',
    required: false,
  })
  @Transform(({ value }: { value: string | undefined }) =>
    value === '' ? undefined : value,
  )
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Dirección del contacto de emergencia',
    example: 'Calle 45 # 12-34, Casa 101',
    required: false,
  })
  @Transform(({ value }: { value: string | undefined }) =>
    value === '' ? undefined : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(200)
  address?: string;

  @ApiProperty({
    description: 'Ciudad del contacto de emergencia',
    example: 'Bogotá',
    required: false,
  })
  @Transform(({ value }: { value: string | undefined }) =>
    value === '' ? undefined : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  city?: string;

  @ApiProperty({
    description: 'Estado o departamento del contacto de emergencia',
    example: 'Cundinamarca',
    required: false,
  })
  @Transform(({ value }: { value: string | undefined }) =>
    value === '' ? undefined : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  state?: string;

  @ApiProperty({
    description: 'Código postal del contacto de emergencia',
    example: '110111',
    required: false,
  })
  @Transform(({ value }: { value: string | undefined }) =>
    value === '' ? undefined : value,
  )
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zipCode?: string;

  @ApiProperty({
    description:
      'ID de la relación con el participante (de catálogo relationships)',
    example: 4,
  })
  @IsNumber()
  relationshipId: number;
}

export class CreateFamilyMemberDto {
  @IsString()
  name: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  occupation: string;

  @IsNumber()
  familyRelationshipId: number;

  @IsNumber()
  academicLevelId: number;
}

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
  academicLevelId?: number;

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

// DTO principal (definido al final)
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
  phoneNumber: string;

  @ApiProperty({
    description: 'Correo electrónico del participante',
    example: 'ejemplo@correo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNumber()
  documentTypeId: number;

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

  @ApiProperty({
    description: 'Estado o departamento del participante',
    example: 'Cundinamarca',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  state?: string;

  @ApiProperty({
    description: 'Código postal de la dirección del participante',
    example: '110111',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  religiousAffiliation: string;

  @IsNumber()
  genderId: number;

  @IsNumber()
  maritalStatusId: number;

  @IsNumber()
  healthInsuranceId: number;

  @IsOptional()
  @IsString()
  customHealthInsurance?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  referralSource?: string;

  // CONTACTOS DE EMERGENCIA (array - puede tener múltiples contactos)
  @ApiProperty({
    description:
      'Lista de contactos de emergencia del participante. Puede incluir uno o varios contactos.',
    type: [CreateEmergencyContactDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyContactDto)
  emergencyContacts?: CreateEmergencyContactDto[];

  // USUARIO QUE REGISTRA AL PARTICIPANTE
  @ApiProperty({
    description: 'ID del usuario que registra al participante en el sistema',
    example: 1,
    minimum: 1,
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    {
      message: 'registeredById must be a valid user ID number',
    },
  )
  registeredById: number;

  // RELACIONES FAMILIARES (permanecen en Participant)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberDto)
  familyMembers?: CreateFamilyMemberDto[];

  // HISTORIAL BIOPSICOSOCIAL (información personal del participante)
  @ApiProperty({
    description: 'Historia biopsicosocial del participante',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBioPsychosocialHistoryDto)
  bioPsychosocialHistory?: CreateBioPsychosocialHistoryDto;
}
