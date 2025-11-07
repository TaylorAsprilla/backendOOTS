import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentifiedSituationsService } from './identified-situations.service';
import { IdentifiedSituationsController } from './identified-situations.controller';
import { IdentifiedSituation } from './entities/identified-situation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdentifiedSituation])],
  controllers: [IdentifiedSituationsController],
  providers: [IdentifiedSituationsService],
  exports: [IdentifiedSituationsService],
})
export class IdentifiedSituationsModule {}
