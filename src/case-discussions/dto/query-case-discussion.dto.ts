import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CaseDiscussionStatus } from '../enums/case-discussion-status.enum';

export class QueryCaseDiscussionDto {
  @ApiPropertyOptional({ enum: CaseDiscussionStatus })
  @IsOptional()
  @IsEnum(CaseDiscussionStatus)
  status?: CaseDiscussionStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}