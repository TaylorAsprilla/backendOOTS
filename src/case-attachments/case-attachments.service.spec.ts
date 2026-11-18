import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CaseStatus, CaseType, Role } from '../common/enums';
import { Case } from '../participants/entities/case.entity';
import { User } from '../users/entities/user.entity';
import { CaseAttachment, CaseAttachmentEvent } from './case-attachment.entity';
import {
  AttachmentCategory,
  AttachmentContext,
  AttachmentStatus,
} from './case-attachment.enums';
import { CaseAttachmentsService } from './case-attachments.service';
import { S3StorageService } from './s3-storage.service';
import { VirusScannerService } from './virus-scanner.service';

const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const upload = {
  originalname: 'relevo_maria.pdf',
  mimetype: 'application/pdf',
  buffer: PDF,
  size: PDF.length,
};
const input = {
  caseId: 4,
  context: AttachmentContext.CONSENT,
  category: AttachmentCategory.RELEASE_OF_LIABILITY,
};

const user = (id: number, role: Role, countryId = 3) =>
  Object.assign(new User(), { id, countryId, role: { name: role } });

describe('CaseAttachmentsService', () => {
  const make = (caseOverrides: Partial<Case> = {}, saveFails = false) => {
    const caseEntity = Object.assign(new Case(), {
      id: 4,
      createdById: 7,
      assignedToId: 7,
      status: CaseStatus.OPEN,
      caseType: CaseType.ACTIVE_CASE,
      participant: { countryId: 3 },
      ...caseOverrides,
    });
    const stored = Object.assign(new CaseAttachment(), {
      id: 11,
      caseId: 4,
      status: AttachmentStatus.ACTIVE,
      storageKey: 'cases/4/consents/x.pdf',
      originalName: 'relevo_maria.pdf',
    });
    const attachments = {
      create: jest.fn((v: object) => v),
      save: jest.fn((v: CaseAttachment) =>
        saveFails
          ? Promise.reject(new Error('db'))
          : Promise.resolve({ ...v, id: 11 }),
      ),
      findOne: jest.fn().mockResolvedValue(stored),
      findOneOrFail: jest.fn().mockResolvedValue(stored),
      find: jest.fn().mockResolvedValue([stored]),
    };
    const events = {
      create: jest.fn((v: object) => v),
      save: jest.fn().mockResolvedValue({}),
    };
    const cases = { findOne: jest.fn().mockResolvedValue(caseEntity) };
    const storage = {
      put: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      presignedDownloadUrl: jest.fn().mockResolvedValue('https://s3/signed'),
      downloadTtlSeconds: 60,
    };
    const config = { get: jest.fn() };
    const scanner = { assertClean: jest.fn().mockResolvedValue(undefined) };
    const service = new CaseAttachmentsService(
      attachments as unknown as Repository<CaseAttachment>,
      events as unknown as Repository<CaseAttachmentEvent>,
      cases as unknown as Repository<Case>,
      storage as unknown as S3StorageService,
      config as unknown as ConfigService,
      scanner as unknown as VirusScannerService,
    );
    return { service, attachments, events, storage, stored, scanner };
  };

  it('stores the file privately under a case prefix with a random key', async () => {
    const { service, storage, events } = make();
    const view = await service.upload(
      input,
      upload,
      user(7, Role.TRABAJO_SOCIAL),
    );
    const key = storage.put.mock.calls[0][0] as string;
    expect(key).toMatch(/^cases\/4\/consents\/[0-9a-f-]{36}\.pdf$/);
    expect(key).not.toContain('relevo');
    expect(view).not.toHaveProperty('storageKey');
    expect(events.save).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'UPLOAD', userId: 7 }),
    );
  });

  it('keeps brief-consultation documents under a separate prefix', async () => {
    const { service, storage } = make({
      caseType: CaseType.BRIEF_CONSULTATION,
    });
    await service.upload(input, upload, user(7, Role.TRABAJO_SOCIAL));
    expect(storage.put.mock.calls[0][0]).toMatch(
      /^brief-consultations\/4\/consents\//,
    );
  });

  it('requires a valid category for the section and a description for OTHER', async () => {
    const { service, storage } = make();
    const ts = user(7, Role.TRABAJO_SOCIAL);
    await expect(
      service.upload(
        { ...input, category: AttachmentCategory.REFERRAL_FORM },
        upload,
        ts,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.upload(
        { ...input, category: AttachmentCategory.OTHER },
        upload,
        ts,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('rejects a file flagged by the antivirus before touching S3', async () => {
    const { service, storage, scanner } = make();
    scanner.assertClean.mockRejectedValueOnce(
      new BadRequestException('infectado'),
    );
    await expect(
      service.upload(input, upload, user(7, Role.TRABAJO_SOCIAL)),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('rejects invalid files before touching S3', async () => {
    const { service, storage } = make();
    await expect(
      service.upload(
        input,
        { ...upload, buffer: Buffer.from('MZ'), size: 2 },
        user(7, Role.TRABAJO_SOCIAL),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('removes the S3 object when the metadata cannot be saved', async () => {
    const { service, storage } = make({}, true);
    await expect(
      service.upload(input, upload, user(7, Role.TRABAJO_SOCIAL)),
    ).rejects.toThrow('db');
    expect(storage.remove).toHaveBeenCalledTimes(1);
  });

  it('applies the country and ownership rules', async () => {
    const { service } = make();
    await expect(
      service.list(4, user(1, Role.ADMIN_COUNTRY, 1)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.list(4, user(99, Role.ADMIN_COUNTRY, 3)),
    ).resolves.toHaveLength(1);
    await expect(service.list(4, user(1, Role.ADMIN, 1))).resolves.toHaveLength(
      1,
    );
    await expect(
      service.list(4, user(8, Role.TRABAJO_SOCIAL)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.getDownloadUrl(11, user(8, Role.TRABAJO_SOCIAL)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks uploads and deletions on closed cases for every role but allows reading', async () => {
    const { service, storage, attachments } = make({
      status: CaseStatus.CLOSED,
    });
    for (const u of [
      user(1, Role.ADMIN),
      user(99, Role.ADMIN_COUNTRY),
      user(7, Role.TRABAJO_SOCIAL),
    ]) {
      await expect(service.upload(input, upload, u)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.remove(11, u)).rejects.toBeInstanceOf(
        ConflictException,
      );
    }
    expect(storage.put).not.toHaveBeenCalled();
    expect(attachments.save).not.toHaveBeenCalled();
    await expect(
      service.list(4, user(7, Role.TRABAJO_SOCIAL)),
    ).resolves.toHaveLength(1);
    await expect(
      service.getDownloadUrl(11, user(7, Role.TRABAJO_SOCIAL)),
    ).resolves.toMatchObject({ url: 'https://s3/signed' });
  });

  it('returns a short-lived URL, audits the download and never exposes the key', async () => {
    const { service, events } = make();
    const result = await service.getDownloadUrl(
      11,
      user(7, Role.TRABAJO_SOCIAL),
    );
    expect(result).toEqual({
      url: 'https://s3/signed',
      fileName: 'relevo_maria.pdf',
      expiresInSeconds: 60,
    });
    expect(events.save).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DOWNLOAD', userId: 7 }),
    );
  });

  it('soft-deletes keeping the record and the object', async () => {
    const { service, attachments, storage, events } = make();
    await service.remove(11, user(7, Role.TRABAJO_SOCIAL));
    expect(attachments.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AttachmentStatus.DELETED,
        deletedById: 7,
      }),
    );
    expect(storage.remove).not.toHaveBeenCalled();
    expect(events.save).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE' }),
    );
  });

  it('treats a deleted document as not found', async () => {
    const { service, attachments } = make();
    attachments.findOne.mockResolvedValue({
      id: 11,
      status: AttachmentStatus.DELETED,
    });
    await expect(
      service.getDownloadUrl(11, user(1, Role.ADMIN)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
