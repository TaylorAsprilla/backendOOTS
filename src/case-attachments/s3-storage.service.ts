import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Almacenamiento privado en S3. Credenciales: cadena por defecto del SDK
 * (rol de la instancia de Elastic Beanstalk); nunca se guardan en el código.
 */
@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private client?: S3Client;

  constructor(private readonly config: ConfigService) {}

  get bucket(): string {
    const bucket = this.config.get<string>('S3_DOCUMENTS_BUCKET');
    if (!bucket) {
      throw new ServiceUnavailableException(
        'El almacenamiento de documentos no está configurado',
      );
    }
    return bucket;
  }

  get downloadTtlSeconds(): number {
    return Number(this.config.get('DOCUMENTS_URL_TTL_SECONDS') ?? 60);
  }

  private s3(): S3Client {
    this.client ??= new S3Client({
      region: this.config.get<string>('AWS_REGION') ?? 'us-east-1',
    });
    return this.client;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    try {
      await this.s3().send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ContentDisposition: 'attachment',
          ServerSideEncryption: 'AES256',
          // Protección contra sobrescritura accidental
          IfNoneMatch: '*',
        }),
      );
    } catch (error) {
      this.logger.error(
        `No se pudo guardar el objeto ${key}: ${error instanceof Error ? error.name : 'error'}`,
      );
      throw new ServiceUnavailableException(
        'No fue posible almacenar el documento. Intente nuevamente',
      );
    }
  }

  /** Solo para compensar una carga cuyo registro en BD falló. */
  async remove(key: string): Promise<void> {
    await this.s3().send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /** URL GET prefirmada de corta duración; no se persiste. */
  async presignedDownloadUrl(key: string, fileName: string): Promise<string> {
    const safeName = encodeURIComponent(fileName);
    return await getSignedUrl(
      this.s3(),
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename*=UTF-8''${safeName}`,
      }),
      { expiresIn: this.downloadTtlSeconds },
    );
  }
}
