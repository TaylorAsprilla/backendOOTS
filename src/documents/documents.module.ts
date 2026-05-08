import { Module } from '@nestjs/common';
import { CasesModule } from '../cases/cases.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentGeneratorService } from './pdf/pdf.service';

@Module({
  imports: [CasesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentGeneratorService],
  exports: [DocumentsService, DocumentGeneratorService],
})
export class DocumentsModule {}
