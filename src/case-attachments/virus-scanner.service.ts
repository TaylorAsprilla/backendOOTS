import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

export type ScanResult = { clean: true } | { clean: false; signature: string };

/**
 * Antivirus de archivos subidos mediante un demonio ClamAV (protocolo INSTREAM).
 *
 * - Sin `CLAMAV_HOST` el análisis está desactivado (se avisa una vez en el log).
 * - Con `CLAMAV_HOST`, un archivo infectado siempre se rechaza. Si el demonio no
 *   responde, se rechaza la carga (falla cerrada) salvo `CLAMAV_FAIL_OPEN=true`.
 *
 * Variables: CLAMAV_HOST, CLAMAV_PORT (3310), CLAMAV_TIMEOUT_MS (15000),
 * CLAMAV_FAIL_OPEN (false).
 */
@Injectable()
export class VirusScannerService {
  private readonly logger = new Logger(VirusScannerService.name);
  private warnedDisabled = false;

  constructor(private readonly config: ConfigService) {}

  get enabled(): boolean {
    return !!this.config.get<string>('CLAMAV_HOST');
  }

  /** Lanza BadRequest si el archivo está infectado; 503 si no se pudo analizar. */
  async assertClean(buffer: Buffer): Promise<void> {
    if (!this.enabled) {
      if (!this.warnedDisabled) {
        this.warnedDisabled = true;
        this.logger.warn(
          'Antivirus desactivado (defina CLAMAV_HOST para analizar los archivos subidos)',
        );
      }
      return;
    }
    let result: ScanResult;
    try {
      result = await this.scan(buffer);
    } catch (error) {
      this.logger.error(
        `No fue posible analizar el archivo: ${(error as Error).message}`,
      );
      if (this.config.get<string>('CLAMAV_FAIL_OPEN') === 'true') return;
      throw new ServiceUnavailableException(
        'No fue posible analizar el archivo en este momento. Intente de nuevo más tarde.',
      );
    }
    if (!result.clean) {
      this.logger.warn(
        `Archivo rechazado por el antivirus: ${result.signature}`,
      );
      throw new BadRequestException(
        'El archivo fue rechazado porque el antivirus detectó contenido malicioso',
      );
    }
  }

  scan(buffer: Buffer): Promise<ScanResult> {
    const host = this.config.get<string>('CLAMAV_HOST')!;
    const port = Number(this.config.get<string>('CLAMAV_PORT') ?? 3310);
    const timeout = Number(
      this.config.get<string>('CLAMAV_TIMEOUT_MS') ?? 15000,
    );

    return new Promise<ScanResult>((resolve, reject) => {
      const socket = net.createConnection({ host, port });
      let response = '';
      socket.setTimeout(timeout, () => {
        socket.destroy();
        reject(new Error('Tiempo de espera agotado'));
      });
      socket.on('error', reject);
      socket.on('data', (chunk) => (response += chunk.toString('utf8')));
      socket.on('close', () => {
        const text = response.replace(/\0/g, '').trim();
        if (/OK$/.test(text)) return resolve({ clean: true });
        const found = /stream:\s*(.+?)\s+FOUND$/.exec(text);
        if (found) return resolve({ clean: false, signature: found[1] });
        reject(new Error(`Respuesta inesperada de ClamAV: ${text || 'vacía'}`));
      });

      socket.on('connect', () => {
        socket.write('zINSTREAM\0');
        const CHUNK = 64 * 1024;
        for (let offset = 0; offset < buffer.length; offset += CHUNK) {
          const part = buffer.subarray(offset, offset + CHUNK);
          const size = Buffer.alloc(4);
          size.writeUInt32BE(part.length);
          socket.write(size);
          socket.write(part);
        }
        socket.write(Buffer.alloc(4)); // fin del flujo
      });
    });
  }
}
