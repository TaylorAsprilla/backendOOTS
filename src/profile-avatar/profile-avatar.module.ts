import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CaseAttachmentsModule } from '../case-attachments/case-attachments.module';
import { ProfileAvatarController } from './profile-avatar.controller';
import { ProfileAvatarService } from './profile-avatar.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CaseAttachmentsModule],
  controllers: [ProfileAvatarController],
  providers: [ProfileAvatarService],
})
export class ProfileAvatarModule {}
