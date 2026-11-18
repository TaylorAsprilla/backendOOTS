import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from '../participants/entities/case.entity';
import { CaseAttachment, CaseAttachmentEvent } from './case-attachment.entity';
import { CaseAttachmentsController } from './case-attachments.controller';
import { CaseAttachmentsService } from './case-attachments.service';
import { S3StorageService } from './s3-storage.service';
import { VirusScannerService } from './virus-scanner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Case, CaseAttachment, CaseAttachmentEvent]),
  ],
  controllers: [CaseAttachmentsController],
  providers: [CaseAttachmentsService, S3StorageService, VirusScannerService],
})
export class CaseAttachmentsModule {}
