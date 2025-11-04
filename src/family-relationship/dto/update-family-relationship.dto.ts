import { PartialType } from '@nestjs/swagger';
import { CreateFamilyRelationshipDto } from './create-family-relationship.dto';

export class UpdateFamilyRelationshipDto extends PartialType(
  CreateFamilyRelationshipDto,
) {}
