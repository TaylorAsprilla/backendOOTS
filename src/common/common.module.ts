import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogSeedService } from './services';
import { CatalogController } from './catalog.controller';
import { DocumentTypesModule } from '../document-types/document-types.module';
import { GendersModule } from '../genders/genders.module';
import { MaritalStatusModule } from '../marital-status/marital-status.module';
import { HealthInsuranceModule } from '../health-insurance/health-insurance.module';
import { HousingTypeModule } from '../housing-type/housing-type.module';
import { FamilyRelationshipModule } from '../family-relationship/family-relationship.module';
import { IncomeSourceModule } from '../income-source/income-source.module';
import { IncomeLevelModule } from '../income-level/income-level.module';
import { IdentifiedSituation } from 'src/identified-situations/entities';
import { ProcessType } from 'src/process-types/entities/process-type.entity';
import { TreatmentStatus } from 'src/treatment-statuses/entities/treatment-status.entity';
import { AcademicLevel } from 'src/academic-levels/entities/academic-level.entity';
import { TypeProgress } from 'src/type-progress/entities/type-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IdentifiedSituation,
      ProcessType,
      TreatmentStatus,
      AcademicLevel,
      TypeProgress,
    ]),
    DocumentTypesModule,
    GendersModule,
    MaritalStatusModule,
    HealthInsuranceModule,
    HousingTypeModule,
    FamilyRelationshipModule,
    IncomeSourceModule,
    IncomeLevelModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogSeedService],
  exports: [TypeOrmModule, CatalogSeedService],
})
export class CommonModule {}
