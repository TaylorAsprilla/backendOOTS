import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProfileAvatarService } from './profile-avatar.service';
import { validateAvatarImage } from './image-validation';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32),
]);
const JPG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(32),
]);
const WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.alloc(4),
  Buffer.from('WEBP'),
  Buffer.alloc(16),
]);

const file = (buffer: Buffer, mimetype: string, originalname = 'a.png') => ({
  originalname,
  mimetype,
  buffer,
  size: buffer.length,
});

describe('validateAvatarImage', () => {
  it('accepts JPG, PNG and WebP by real content', () => {
    expect(validateAvatarImage(file(PNG, 'image/png')).extension).toBe('png');
    expect(validateAvatarImage(file(JPG, 'image/jpeg')).extension).toBe('jpg');
    expect(validateAvatarImage(file(WEBP, 'image/webp')).extension).toBe(
      'webp',
    );
  });

  it('rejects scripts, SVG, PDF and executables renamed as images', () => {
    for (const content of [
      Buffer.from('<svg onload="alert(1)"></svg>'),
      Buffer.from('%PDF-1.4 x'),
      Buffer.from('MZ\x90\x00 exe payload'),
      Buffer.from('GIF89a......'),
    ]) {
      expect(() => validateAvatarImage(file(content, 'image/png'))).toThrow(
        BadRequestException,
      );
    }
  });

  it('rejects a declared type that does not match the content', () => {
    expect(() => validateAvatarImage(file(PNG, 'image/jpeg'))).toThrow(
      BadRequestException,
    );
  });

  it('rejects empty and oversized images', () => {
    expect(() => validateAvatarImage(undefined)).toThrow(BadRequestException);
    expect(() =>
      validateAvatarImage(file(Buffer.alloc(0), 'image/png')),
    ).toThrow(BadRequestException);
    expect(() => validateAvatarImage(file(PNG, 'image/png'), 10)).toThrow(
      /tamaño máximo/,
    );
  });
});

describe('ProfileAvatarService', () => {
  const make = (user: Record<string, unknown> | null) => {
    const users = {
      findOneOrFail: jest.fn().mockResolvedValue(user),
      findOne: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const storage = {
      put: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({ body: PNG, contentType: 'image/png' }),
    };
    const scanner = { assertClean: jest.fn().mockResolvedValue(undefined) };
    const service = new ProfileAvatarService(
      users as never,
      storage as never,
      scanner as never,
    );
    return { service, users, storage, scanner };
  };

  it('stores the photo under the user prefix and removes the previous one', async () => {
    const { service, users, storage } = make({
      id: 7,
      avatarKey: 'avatars/7/old.png',
    });
    await service.upload(7, file(PNG, 'image/png'));
    const key = storage.put.mock.calls[0][0] as string;
    expect(key).toMatch(/^avatars\/7\/[0-9a-f-]{36}\.png$/);
    expect(users.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ avatarKey: key }),
    );
    expect(storage.remove).toHaveBeenCalledWith('avatars/7/old.png');
  });

  it('does not touch S3 when the image is invalid or infected', async () => {
    const invalid = make({ id: 7 });
    await expect(
      invalid.service.upload(7, file(Buffer.from('nope'), 'image/png')),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(invalid.storage.put).not.toHaveBeenCalled();

    const infected = make({ id: 7 });
    infected.scanner.assertClean.mockRejectedValueOnce(
      new BadRequestException('virus'),
    );
    await expect(
      infected.service.upload(7, file(PNG, 'image/png')),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(infected.storage.put).not.toHaveBeenCalled();
  });

  it('removes the new object when the database update fails', async () => {
    const { service, users, storage } = make({ id: 7 });
    users.update.mockRejectedValueOnce(new Error('db'));
    await expect(service.upload(7, file(PNG, 'image/png'))).rejects.toThrow(
      'db',
    );
    expect(storage.remove).toHaveBeenCalledTimes(1);
  });

  it('returns null when the user has no photo and clears it on remove', async () => {
    await expect(
      make({ id: 7, avatarKey: null }).service.get(7),
    ).resolves.toBeNull();
    const { service, users, storage } = make({
      id: 7,
      avatarKey: 'avatars/7/a.png',
    });
    await service.remove(7);
    expect(users.update).toHaveBeenCalledWith(7, {
      avatarKey: null,
      avatarUpdatedAt: null,
    });
    expect(storage.remove).toHaveBeenCalledWith('avatars/7/a.png');
  });

  it('reports photo and tour status', async () => {
    await expect(
      make({
        id: 7,
        avatarKey: 'a',
        avatarTourSeenAt: new Date(),
      }).service.status(7),
    ).resolves.toEqual({ hasAvatar: true, tourSeen: true });
    await expect(make({ id: 7 }).service.status(7)).resolves.toEqual({
      hasAvatar: false,
      tourSeen: false,
    });
  });

  it('lets a country admin see only photos from their own country', async () => {
    const { service } = make({
      id: 9,
      countryId: 2,
      avatarKey: 'avatars/9/a.png',
    });
    const viewer = (countryId: number) =>
      ({ role: { name: 'ADMIN_COUNTRY' }, countryId }) as never;
    await expect(service.getForViewer(viewer(2), 9)).resolves.not.toBeNull();
    await expect(service.getForViewer(viewer(3), 9)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    const admin = { role: { name: 'ADMIN' } } as never;
    await expect(service.getForViewer(admin, 9)).resolves.not.toBeNull();
  });
});
