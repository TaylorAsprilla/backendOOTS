import { BadRequestException } from '@nestjs/common';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export interface UploadedImage {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface DetectedImage {
  extension: 'jpg' | 'png' | 'webp';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/**
 * Valida una foto de perfil por su contenido real (firma del archivo), no por
 * la extensión ni el MIME que declara el cliente. Solo JPG, PNG y WebP.
 */
export function validateAvatarImage(
  file: UploadedImage | undefined,
  maxBytes: number = AVATAR_MAX_BYTES,
): DetectedImage {
  if (!file || !file.buffer?.length) {
    throw new BadRequestException('Seleccione una imagen');
  }
  if (file.buffer.length > maxBytes) {
    throw new BadRequestException(
      `La imagen supera el tamaño máximo de ${Math.round(maxBytes / 1024 / 1024)} MB`,
    );
  }
  const b = file.buffer;
  let detected: DetectedImage | null = null;
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    detected = { extension: 'jpg', mimeType: 'image/jpeg' };
  } else if (b.length > 8 && b.subarray(0, 8).equals(PNG_SIGNATURE)) {
    detected = { extension: 'png', mimeType: 'image/png' };
  } else if (
    b.length > 12 &&
    b.subarray(0, 4).toString('latin1') === 'RIFF' &&
    b.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    detected = { extension: 'webp', mimeType: 'image/webp' };
  }
  if (!detected) {
    throw new BadRequestException(
      'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP',
    );
  }
  if (file.mimetype && file.mimetype !== detected.mimeType) {
    throw new BadRequestException(
      'El contenido de la imagen no coincide con su tipo declarado',
    );
  }
  return detected;
}
