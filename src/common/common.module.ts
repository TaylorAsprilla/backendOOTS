import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IdentifiedSituation,
  ApproachType,
  ProcessType,
  TreatmentStatus,
  AcademicLevel,
} from './entities';
import { CatalogSeedService } from './services';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IdentifiedSituation,
      ApproachType,
      ProcessType,
      TreatmentStatus,
      AcademicLevel,
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogSeedService],
  exports: [TypeOrmModule, CatalogSeedService],
})
export class CommonModule {}
