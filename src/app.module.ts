import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ParticipantsModule } from './participants/participants.module';
import { CasesModule } from './cases/cases.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { MailModule } from './mail/mail.module';
import { AcademicLevelsModule } from './academic-levels/academic-levels.module';
import { ApproachTypesModule } from './approach-types/approach-types.module';
import { DocumentTypesModule } from './document-types/document-types.module';
import { GendersModule } from './genders/genders.module';
import { MaritalStatusModule } from './marital-status/marital-status.module';
import { HealthInsuranceModule } from './health-insurance/health-insurance.module';
import { IncomeSourceModule } from './income-source/income-source.module';
import { IncomeLevelModule } from './income-level/income-level.module';
import { HousingTypeModule } from './housing-type/housing-type.module';
import { FamilyRelationshipModule } from './family-relationship/family-relationship.module';
import { IdentifiedSituationsModule } from './identified-situations/identified-situations.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3, // 3 requests por segundo
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20, // 20 requests por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || '3307'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
      autoLoadEntities: true,
      logging:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn', 'log']
          : false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      charset: 'utf8mb4',
      timezone: 'Z',
      extra: {
        charset: 'utf8mb4_unicode_ci',
      },
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    ParticipantsModule,
    CasesModule,
    CatalogsModule,
    MailModule,
    AcademicLevelsModule,
    ApproachTypesModule,
    DocumentTypesModule,
    GendersModule,
    MaritalStatusModule,
    HealthInsuranceModule,
    IncomeSourceModule,
    IncomeLevelModule,
    HousingTypeModule,
    FamilyRelationshipModule,
    IdentifiedSituationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
