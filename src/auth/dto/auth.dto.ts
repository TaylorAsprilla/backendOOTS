import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Primer nombre del usuario',
    example: 'Juan',
  })
  @IsString({ message: 'El primer nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El primer nombre es requerido' })
  @MinLength(2, {
    message: 'El primer nombre debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El primer nombre no puede exceder 50 caracteres',
  })
  firstName: string;

  @ApiProperty({
    description: 'Segundo nombre del usuario',
    example: 'Carlos',
    required: false,
  })
  @IsString({ message: 'El segundo nombre debe ser un texto' })
  @IsOptional()
  secondName?: string;

  @ApiProperty({
    description: 'Primer apellido del usuario',
    example: 'Pérez',
  })
  @IsString({ message: 'El primer apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  @MinLength(2, {
    message: 'El primer apellido debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El primer apellido no puede exceder 50 caracteres',
  })
  firstLastName: string;

  @ApiProperty({
    description: 'Segundo apellido del usuario',
    example: 'García',
    required: false,
  })
  @IsString({ message: 'El segundo apellido debe ser un texto' })
  @IsOptional()
  secondLastName?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255, {
    message: 'La contraseña no puede exceder 255 caracteres',
  })
  password: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '+57 300 123 4567',
    required: false,
  })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Cargo o posición del usuario',
    example: 'Psicólogo Clínico',
    required: false,
  })
  @IsString({ message: 'La posición debe ser un texto' })
  @IsOptional()
  @MinLength(2, { message: 'La posición debe tener al menos 2 caracteres' })
  @MaxLength(100, {
    message: 'La posición no puede exceder 100 caracteres',
  })
  position?: string;

  @ApiProperty({
    description: 'Organización del usuario',
    example: 'Centro de Bienestar Familiar',
    required: false,
  })
  @IsString({ message: 'La organización debe ser un texto' })
  @IsOptional()
  @MinLength(2, {
    message: 'La organización debe tener al menos 2 caracteres',
  })
  @MaxLength(200, {
    message: 'La organización no puede exceder 200 caracteres',
  })
  organization?: string;

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '12345678',
  })
  @IsString({ message: 'El número de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El número de documento es requerido' })
  @MinLength(5, {
    message: 'El número de documento debe tener al menos 5 caracteres',
  })
  @MaxLength(20, {
    message: 'El número de documento no puede exceder 20 caracteres',
  })
  documentNumber: string;

  @ApiProperty({
    description: 'Dirección de residencia',
    example: 'Carrera 10 # 15-20',
  })
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  address: string;

  @ApiProperty({
    description: 'Ciudad de residencia',
    example: 'Bogotá',
  })
  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
  })
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe ser una fecha válida' },
  )
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  birthDate: string;

  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 1,
  })
  @IsNumber({}, { message: 'El tipo de documento debe ser un número' })
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  documentTypeId: number;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Usuario registrado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Información del usuario registrado',
  })
  user: {
    id: number;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    email: string;
    phoneNumber?: string;
    position?: string;
    organization?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 3600,
  })
  expires_in: number;

  @ApiProperty({
    description: 'Información del usuario autenticado',
  })
  user: {
    id: number;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    email: string;
    phoneNumber?: string;
    position?: string;
    organization?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class UserProfileDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Primer nombre',
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Segundo nombre',
    example: 'Carlos',
    required: false,
  })
  secondName?: string;

  @ApiProperty({
    description: 'Primer apellido',
    example: 'Pérez',
  })
  firstLastName: string;

  @ApiProperty({
    description: 'Segundo apellido',
    example: 'García',
    required: false,
  })
  secondLastName?: string;

  @ApiProperty({
    description: 'Email',
    example: 'juan.perez@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Teléfono',
    example: '+57 300 123 4567',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Posición',
    example: 'Psicólogo Clínico',
    required: false,
  })
  position?: string;

  @ApiProperty({
    description: 'Organización',
    example: 'Centro de Bienestar',
    required: false,
  })
  organization?: string;

  @ApiProperty({
    description: 'Estado del usuario',
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización',
  })
  updatedAt: Date;
}
