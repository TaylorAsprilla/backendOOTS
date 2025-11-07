import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeolocationService } from './geolocation.service';
import { Geolocation } from './entities/geolocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Geolocation])],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
