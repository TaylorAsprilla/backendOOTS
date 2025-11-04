import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyRelationship } from './entities/family-relationship.entity';
import { FamilyRelationshipController } from './family-relationship.controller';
import { FamilyRelationshipService } from './family-relationship.service';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyRelationship])],
  controllers: [FamilyRelationshipController],
  providers: [FamilyRelationshipService],
  exports: [TypeOrmModule, FamilyRelationshipService],
})
export class FamilyRelationshipModule {}
