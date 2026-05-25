import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsInt,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
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

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  headquarters?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentNumber?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  documentTypeId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  countryId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  roleId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  mitaNumber?: number;
}
