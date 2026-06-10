import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CaseDiscussionFamilyMemberDto {
  @ApiProperty({
    description: 'Nombre del familiar',
    example: 'Ana Rivera',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Edad del familiar al momento de la discusión',
    example: 38,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @ApiProperty({
    description: 'Parentesco del familiar con el cliente',
    example: 'Madre',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  relationship!: string;

  @ApiPropertyOptional({
    description: 'Ocupación del familiar',
    example: 'Comerciante',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización en el PDF y respuestas',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}