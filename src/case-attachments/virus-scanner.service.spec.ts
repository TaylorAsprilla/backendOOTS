import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';
import { VirusScannerService } from './virus-scanner.service';

const makeScanner = (env: Record<string, string | undefined>) =>
  new VirusScannerService({
    get: (key: string) => env[key],
  } as unknown as ConfigService);

/** Servidor que imita a clamd (INSTREAM) y responde con `reply`. */
const fakeClamd = (
  reply: string,
): Promise<{ port: number; close: () => void; received: () => Buffer }> =>
  new Promise((resolve) => {
    let received = Buffer.alloc(0);
    const server = net.createServer((socket) => {
      socket.on('data', (chunk) => {
        received = Buffer.concat([received, chunk]);
        // el flujo termina con un bloque de longitud cero
        if (received.subarray(-4).equals(Buffer.alloc(4))) {
          socket.end(reply + '\0');
        }
      });
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({
        port: (server.address() as net.AddressInfo).port,
        close: () => server.close(),
        received: () => received,
      });
    });
  });

describe('VirusScannerService', () => {
  it('is disabled without CLAMAV_HOST and lets the file through', async () => {
    const scanner = makeScanner({});
    expect(scanner.enabled).toBe(false);
    await expect(
      scanner.assertClean(Buffer.from('x')),
    ).resolves.toBeUndefined();
  });

  it('accepts a clean file and sends it using the INSTREAM protocol', async () => {
    const clamd = await fakeClamd('stream: OK');
    try {
      const scanner = makeScanner({
        CLAMAV_HOST: '127.0.0.1',
        CLAMAV_PORT: String(clamd.port),
      });
      await expect(
        scanner.assertClean(Buffer.from('%PDF-1.4 hola')),
      ).resolves.toBeUndefined();
      expect(clamd.received().toString('latin1')).toContain('zINSTREAM');
      expect(clamd.received().toString('latin1')).toContain('%PDF-1.4 hola');
    } finally {
      clamd.close();
    }
  });

  it('rejects an infected file', async () => {
    const clamd = await fakeClamd('stream: Win.Test.EICAR_HDB-1 FOUND');
    try {
      const scanner = makeScanner({
        CLAMAV_HOST: '127.0.0.1',
        CLAMAV_PORT: String(clamd.port),
      });
      await expect(
        scanner.assertClean(Buffer.from('virus')),
      ).rejects.toBeInstanceOf(BadRequestException);
    } finally {
      clamd.close();
    }
  });

  it('fails closed when the daemon is unreachable, unless CLAMAV_FAIL_OPEN=true', async () => {
    const down = {
      CLAMAV_HOST: '127.0.0.1',
      CLAMAV_PORT: '1',
      CLAMAV_TIMEOUT_MS: '500',
    };
    await expect(
      makeScanner(down).assertClean(Buffer.from('x')),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(
      makeScanner({ ...down, CLAMAV_FAIL_OPEN: 'true' }).assertClean(
        Buffer.from('x'),
      ),
    ).resolves.toBeUndefined();
  });
});
