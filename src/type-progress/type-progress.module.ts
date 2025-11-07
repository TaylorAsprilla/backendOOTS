import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeProgressService } from './type-progress.service';
import { TypeProgressController } from './type-progress.controller';
import { TypeProgress } from './entities/type-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeProgress])],
  controllers: [TypeProgressController],
  providers: [TypeProgressService],
  exports: [TypeProgressService],
})
export class TypeProgressModule {}
