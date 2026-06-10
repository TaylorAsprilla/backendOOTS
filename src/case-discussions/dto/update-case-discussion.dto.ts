import { PartialType } from '@nestjs/swagger';
import { CreateCaseDiscussionDto } from './create-case-discussion.dto';

export class UpdateCaseDiscussionDto extends PartialType(
  CreateCaseDiscussionDto,
) {}