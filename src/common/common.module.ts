import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentType,
  Gender,
  MaritalStatus,
  HealthInsurance,
  HousingType,
  FamilyRelationship,
  AcademicLevel,
  IncomeSource,
  IncomeLevel,
  IdentifiedSituation,
  ApproachType,
  ProcessType,
  TreatmentStatus,
} from './entities';
import { CatalogSeedService } from './services';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentType,
      Gender,
      MaritalStatus,
      HealthInsurance,
      HousingType,
      FamilyRelationship,
      AcademicLevel,
      IncomeSource,
      IncomeLevel,
      IdentifiedSituation,
      ApproachType,
      ProcessType,
      TreatmentStatus,
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogSeedService],
  exports: [TypeOrmModule, CatalogSeedService],
})
export class CommonModule {}
