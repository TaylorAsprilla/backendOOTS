import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsOptional()
  secondName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstLastName: string;

  @IsString()
  @IsOptional()
  secondLastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[1-9][\d]{0,15}$/, {
    message: 'phoneNumber must be a valid phone number',
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  position?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  headquarters?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  documentTypeId: number;
}
