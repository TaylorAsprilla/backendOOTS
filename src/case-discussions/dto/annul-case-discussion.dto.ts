import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnnulCaseDiscussionDto {
  @ApiProperty({
    description: 'Motivo por el cual se anula la discusión',
    example: 'Se creó por error con un supervisor incorrecto.',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}