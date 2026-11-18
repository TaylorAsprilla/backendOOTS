import { BadRequestException } from '@nestjs/common';
import JSZip from 'jszip';

export interface DetectedFile {
  extension: 'pdf' | 'doc' | 'docx';
  mimeType: string;
}

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: DOCX_MIME,
};

const OLE_SIGNATURE = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const MAX_ZIP_ENTRIES = 5000;

export const ALLOWED_FORMATS_MESSAGE =
  'Formato no permitido. Solo se aceptan archivos PDF (.pdf) y Word (.doc, .docx)';

export function sanitizeFileName(name: string): string {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? '';
  // eslint-disable-next-line no-control-regex
  const clean = base.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean.slice(-255) || 'documento';
}

/**
 * Valida extensión, MIME, firma real del archivo e integridad básica.
 * Nunca confía en lo que declara el cliente.
 */
export async function validateUploadedFile(
  file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  },
  maxBytes: number,
): Promise<DetectedFile> {
  if (!file?.buffer?.length) {
    throw new BadRequestException('El archivo está vacío o no fue enviado');
  }
  if (file.size > maxBytes || file.buffer.length > maxBytes) {
    throw new BadRequestException(
      `El archivo supera el tamaño máximo permitido de ${Math.round(maxBytes / 1024 / 1024)} MB`,
    );
  }

  const name = sanitizeFileName(file.originalname);
  const dot = name.lastIndexOf('.');
  const extension = dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
  const canonicalMime = TYPES[extension];
  if (!canonicalMime) throw new BadRequestException(ALLOWED_FORMATS_MESSAGE);
  if ((file.mimetype ?? '').toLowerCase() !== canonicalMime) {
    throw new BadRequestException(
      'El tipo de archivo no coincide con su extensión',
    );
  }

  const buffer = file.buffer;
  if (extension === 'pdf') {
    const head = buffer.subarray(0, 1024).toString('latin1');
    const tail = buffer
      .subarray(Math.max(0, buffer.length - 1024))
      .toString('latin1');
    if (!head.includes('%PDF-') || !tail.includes('%%EOF')) {
      throw new BadRequestException(
        'El archivo no es un PDF válido o está incompleto',
      );
    }
  } else if (extension === 'doc') {
    if (!buffer.subarray(0, 8).equals(OLE_SIGNATURE)) {
      throw new BadRequestException(
        'El archivo no es un documento Word (.doc) válido',
      );
    }
  } else {
    if (!buffer.subarray(0, 4).equals(ZIP_SIGNATURE)) {
      throw new BadRequestException(
        'El archivo no es un documento Word (.docx) válido',
      );
    }
    try {
      const zip = await JSZip.loadAsync(buffer);
      const names = Object.keys(zip.files);
      if (
        names.length > MAX_ZIP_ENTRIES ||
        !names.includes('[Content_Types].xml') ||
        !names.includes('word/document.xml')
      ) {
        throw new Error('estructura inválida');
      }
    } catch {
      throw new BadRequestException(
        'El archivo no es un documento Word (.docx) válido o está dañado',
      );
    }
  }

  return {
    extension: extension as DetectedFile['extension'],
    mimeType: canonicalMime,
  };
}
