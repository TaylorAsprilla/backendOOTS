import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GendersService } from './genders.service';
import { GendersController } from './genders.controller';
import { Gender } from './entities/gender.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gender])],
  controllers: [GendersController],
  providers: [GendersService],
  exports: [GendersService],
})
export class GendersModule {}
