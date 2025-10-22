import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// DTOs para las relaciones anidadas (definidas primero)
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

// Los DTOs médicos ahora están en src/cases/dto/case.dto.ts

export class CreateClosingNoteDto {
  @IsOptional()
  @IsString()
  closureReason?: string;

  @IsOptional()
  @IsString()
  achievements?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsString()
  observations?: string;
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
  @Matches(/^\+57 3\d{2} \d{3} \d{4}$/, {
    message: 'Phone number must be in format: +57 3XX XXX XXXX',
  })
  phoneNumber: string;

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

  @IsNumber()
  emergencyContactRelationshipId: number;

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

  // ENTIDADES PENDIENTES DE EVALUACIÓN (temporalmente en Participant)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  identifiedSituations?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateClosingNoteDto)
  closingNote?: CreateClosingNoteDto;
}
