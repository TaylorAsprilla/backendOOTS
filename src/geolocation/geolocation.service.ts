import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geolocation } from './entities/geolocation.entity';
import axios from 'axios';

interface IpApiResponse {
  query: string;
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  constructor(
    @InjectRepository(Geolocation)
    private readonly geolocationRepository: Repository<Geolocation>,
  ) {}

  async getGeolocationData(ipAddress: string): Promise<IpApiResponse | null> {
    try {
      // Si es localhost o IP privada, usar una IP pública de prueba
      const isPrivateIp =
        ipAddress === '::1' ||
        ipAddress === '127.0.0.1' ||
        ipAddress.startsWith('192.168.') ||
        ipAddress.startsWith('10.') ||
        ipAddress.startsWith('172.');

      const queryIp = isPrivateIp ? '' : ipAddress; // Si está vacío, ip-api usa la IP del servidor

      const response = await axios.get(`http://ip-api.com/json/${queryIp}`, {
        timeout: 5000, // 5 segundos de timeout
      });

      if (response.data && response.data.status === 'success') {
        return response.data as IpApiResponse;
      }

      this.logger.warn(
        `IP API returned non-success status for IP: ${ipAddress}`,
      );
      return null;
    } catch (error) {
      this.logger.error(
        `Error fetching geolocation data for IP ${ipAddress}:`,
        error.message,
      );
      return null;
    }
  }

  async saveGeolocation(
    userId: number,
    ipAddress: string,
    action: string = 'login',
  ): Promise<Geolocation | null> {
    try {
      // Obtener datos de geolocalización
      const geoData = await this.getGeolocationData(ipAddress);

      if (!geoData) {
        this.logger.warn(`Could not get geolocation data for IP: ${ipAddress}`);
        // Guardar solo la IP aunque no tengamos los datos
        const geolocation = this.geolocationRepository.create({
          userId,
          ipAddress,
          action,
        });
        return await this.geolocationRepository.save(geolocation);
      }

      // Crear el registro de geolocalización
      const geolocation = this.geolocationRepository.create({
        userId,
        ipAddress: geoData.query,
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.region,
        regionName: geoData.regionName,
        city: geoData.city,
        zip: geoData.zip,
        lat: geoData.lat,
        lon: geoData.lon,
        timezone: geoData.timezone,
        isp: geoData.isp,
        org: geoData.org,
        as: geoData.as,
        action,
      });

      const savedGeolocation =
        await this.geolocationRepository.save(geolocation);

      this.logger.log(
        `Geolocation saved for user ${userId} from ${geoData.city}, ${geoData.country}`,
      );

      return savedGeolocation;
    } catch (error) {
      this.logger.error(
        `Error saving geolocation for user ${userId}:`,
        error.message,
      );
      return null;
    }
  }

  async findAllByUser(userId: number): Promise<Geolocation[]> {
    return await this.geolocationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLastByUser(userId: number): Promise<Geolocation | null> {
    return await this.geolocationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
