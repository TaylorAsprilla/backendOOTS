import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
  IsInt,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Primer nombre del usuario',
    example: 'Juan',
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El primer nombre debe ser una cadena de texto' })
  @MinLength(2, {
    message: 'El primer nombre debe tener al menos 2 caracteres',
  })
  @MaxLength(50, { message: 'El primer nombre no debe exceder 50 caracteres' })
  firstName?: string;

  @ApiProperty({
    description: 'Segundo nombre del usuario',
    example: 'Carlos',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El segundo nombre no debe exceder 50 caracteres' })
  secondName?: string;

  @ApiProperty({
    description: 'Primer apellido del usuario',
    example: 'Pérez',
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El primer apellido debe ser una cadena de texto' })
  @MinLength(2, {
    message: 'El primer apellido debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El primer apellido no debe exceder 50 caracteres',
  })
  firstLastName?: string;

  @ApiProperty({
    description: 'Segundo apellido del usuario',
    example: 'González',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El segundo apellido debe ser una cadena de texto' })
  @MaxLength(50, {
    message: 'El segundo apellido no debe exceder 50 caracteres',
  })
  secondLastName?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@ejemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '+57 300 123 4567',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @MaxLength(20, {
    message: 'El número de teléfono no debe exceder 20 caracteres',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Cargo o posición del usuario',
    example: 'Psicólogo',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El cargo debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El cargo no debe exceder 100 caracteres' })
  position?: string;

  @ApiProperty({
    description: 'Sede o ubicación del usuario',
    example: 'Bogotá - Sede Principal',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'La sede debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La sede no debe exceder 200 caracteres' })
  headquarters?: string;

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '1234567890',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @MaxLength(50, {
    message: 'El número de documento no debe exceder 50 caracteres',
  })
  documentNumber?: string;

  @ApiProperty({
    description: 'Dirección de residencia',
    example: 'Calle 123 #45-67',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La dirección no debe exceder 255 caracteres' })
  address?: string;

  @ApiProperty({
    description: 'Ciudad de residencia',
    example: 'Bogotá',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La ciudad no debe exceder 100 caracteres' })
  city?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Debe proporcionar una fecha válida (YYYY-MM-DD)' },
  )
  birthDate?: string;

  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del tipo de documento debe ser un número entero' })
  documentTypeId?: number;

  @ApiProperty({
    description: 'URL del perfil de Facebook',
    example: 'https://facebook.com/usuario',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Facebook debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La URL de Facebook no debe exceder 255 caracteres',
  })
  @Matches(/^https?:\/\/(www\.)?facebook\.com\/.*$|^$/, {
    message: 'Debe proporcionar una URL válida de Facebook',
  })
  facebook?: string;

  @ApiProperty({
    description: 'URL del perfil de Twitter/X',
    example: 'https://twitter.com/usuario',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Twitter debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La URL de Twitter no debe exceder 255 caracteres',
  })
  @Matches(/^https?:\/\/(www\.)?(twitter|x)\.com\/.*$|^$/, {
    message: 'Debe proporcionar una URL válida de Twitter/X',
  })
  twitter?: string;

  @ApiProperty({
    description: 'URL del perfil de Instagram',
    example: 'https://instagram.com/usuario',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Instagram debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La URL de Instagram no debe exceder 255 caracteres',
  })
  @Matches(/^https?:\/\/(www\.)?instagram\.com\/.*$|^$/, {
    message: 'Debe proporcionar una URL válida de Instagram',
  })
  instagram?: string;

  @ApiProperty({
    description: 'URL del perfil de LinkedIn',
    example: 'https://linkedin.com/in/usuario',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'LinkedIn debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La URL de LinkedIn no debe exceder 255 caracteres',
  })
  @Matches(/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.*$|^$/, {
    message: 'Debe proporcionar una URL válida de LinkedIn',
  })
  linkedin?: string;

  @ApiProperty({
    description: 'URL del perfil de GitHub',
    example: 'https://github.com/usuario',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'GitHub debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La URL de GitHub no debe exceder 255 caracteres',
  })
  @Matches(/^https?:\/\/(www\.)?github\.com\/.*$|^$/, {
    message: 'Debe proporcionar una URL válida de GitHub',
  })
  github?: string;
}
