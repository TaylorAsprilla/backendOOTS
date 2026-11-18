import { BadRequestException } from '@nestjs/common';
import JSZip from 'jszip';
import { validateUploadedFile } from './file-validation';

const MB = 1024 * 1024;
const PDF_MIME = 'application/pdf';
const DOC_MIME = 'application/msword';
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const file = (originalname: string, mimetype: string, buffer: Buffer) => ({
  originalname,
  mimetype,
  buffer,
  size: buffer.length,
});

const pdf = () => Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const doc = () =>
  Buffer.concat([
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    Buffer.alloc(64),
  ]);
const docx = async (withDocument = true) => {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<Types/>');
  if (withDocument) zip.file('word/document.xml', '<w:document/>');
  return await zip.generateAsync({ type: 'nodebuffer' });
};

describe('validateUploadedFile', () => {
  it('accepts a valid PDF, DOC and DOCX', async () => {
    await expect(
      validateUploadedFile(file('a.pdf', PDF_MIME, pdf()), 15 * MB),
    ).resolves.toMatchObject({ extension: 'pdf' });
    await expect(
      validateUploadedFile(file('a.doc', DOC_MIME, doc()), 15 * MB),
    ).resolves.toMatchObject({ extension: 'doc' });
    await expect(
      validateUploadedFile(file('A.DOCX', DOCX_MIME, await docx()), 15 * MB),
    ).resolves.toMatchObject({ extension: 'docx' });
  });

  it('rejects images, archives, executables and scripts by extension', async () => {
    for (const name of ['a.png', 'a.zip', 'a.exe', 'a.js', 'a.sh', 'a']) {
      await expect(
        validateUploadedFile(
          file(name, 'application/octet-stream', Buffer.from('x')),
          15 * MB,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
  });

  it('rejects files whose content does not match the extension', async () => {
    const exe = Buffer.from('MZ\x90\x00 fake executable');
    await expect(
      validateUploadedFile(file('fake.pdf', PDF_MIME, exe), 15 * MB),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validateUploadedFile(file('fake.doc', DOC_MIME, exe), 15 * MB),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validateUploadedFile(file('fake.docx', DOCX_MIME, exe), 15 * MB),
    ).rejects.toBeInstanceOf(BadRequestException);
    // un ZIP cualquiera renombrado a .docx
    await expect(
      validateUploadedFile(
        file('zip.docx', DOCX_MIME, await docx(false)),
        15 * MB,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a truncated PDF and a mismatching MIME type', async () => {
    await expect(
      validateUploadedFile(
        file('cut.pdf', PDF_MIME, Buffer.from('%PDF-1.4 partial')),
        15 * MB,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validateUploadedFile(file('a.pdf', 'image/png', pdf()), 15 * MB),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects empty files and files over the configured size', async () => {
    await expect(
      validateUploadedFile(file('a.pdf', PDF_MIME, Buffer.alloc(0)), 15 * MB),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validateUploadedFile(file('a.pdf', PDF_MIME, pdf()), 10),
    ).rejects.toThrow(/tamaño máximo/);
  });
});
