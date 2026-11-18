import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { S3StorageService } from '../case-attachments/s3-storage.service';
import { VirusScannerService } from '../case-attachments/virus-scanner.service';
import { UploadedImage, validateAvatarImage } from './image-validation';

/** Foto de perfil del propio usuario, guardada en S3 (nunca en MySQL). */
@Injectable()
export class ProfileAvatarService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly storage: S3StorageService,
    private readonly scanner: VirusScannerService,
  ) {}

  async upload(
    userId: number,
    file: UploadedImage | undefined,
  ): Promise<{ hasAvatar: true; avatarUpdatedAt: Date }> {
    const image = validateAvatarImage(file);
    await this.scanner.assertClean(file!.buffer);

    const user = await this.users.findOneOrFail({ where: { id: userId } });
    const previousKey = user.avatarKey;
    const key = `avatars/${userId}/${randomUUID()}.${image.extension}`;

    await this.storage.put(key, file!.buffer, image.mimeType);
    const now = new Date();
    try {
      await this.users.update(userId, {
        avatarKey: key,
        avatarUpdatedAt: now,
      });
    } catch (error) {
      await this.storage.remove(key).catch(() => undefined);
      throw error;
    }
    if (previousKey) {
      await this.storage.remove(previousKey).catch(() => undefined);
    }
    return { hasAvatar: true, avatarUpdatedAt: now };
  }

  async get(
    userId: number,
  ): Promise<{ body: Buffer; contentType: string } | null> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user?.avatarKey) return null;
    const object = await this.storage.get(user.avatarKey);
    return {
      body: object.body,
      contentType: object.contentType ?? 'application/octet-stream',
    };
  }

  async remove(userId: number): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user?.avatarKey) return;
    const key = user.avatarKey;
    await this.users.update(userId, { avatarKey: null, avatarUpdatedAt: null });
    await this.storage.remove(key).catch(() => undefined);
  }
}
