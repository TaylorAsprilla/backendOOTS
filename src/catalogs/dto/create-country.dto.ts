import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsUrl,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ example: 'Colombia' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'CO',
    description: 'Código ISO 2 caracteres',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  iso?: string;

  @ApiPropertyOptional({ example: 'es-CO' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @ApiPropertyOptional({ example: 'COP' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: '+57' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  phonePrefix?: string;

  @ApiPropertyOptional({ example: 'https://flagcdn.com/w20/co.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  flagUrl?: string;

  @ApiPropertyOptional({ example: 'es-CO' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  defaultLanguage?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
