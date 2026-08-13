import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import compression from 'compression';

const bootstrapLogger = new Logger('Process');

// Sin estos handlers, una promesa rechazada sin catch en cualquier parte del
// código mata el proceso completo sin dejar rastro (Node >=15 termina el
// proceso por defecto). Los registramos antes de todo para poder ver la
// causa real en los logs la próxima vez que ocurra un crash en producción.
// Se registra el handler para loguear, pero se sigue terminando el proceso
// (fail-fast) porque el estado de la app puede quedar inconsistente y
// systemd/EB ya lo reinicia automáticamente.
process.on('unhandledRejection', (reason) => {
  bootstrapLogger.error('Unhandled Rejection', reason as Error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  bootstrapLogger.error('Uncaught Exception', error.stack);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar middleware de seguridad
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  // Configurar CORS - Soporta CORS_ORIGIN o CORS_ORIGINS
  const corsOriginEnv = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
  const corsOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'https://congregacionmitacol.org',
        'https://www.congregacionmitacol.org',
        'https://mioots.org',
        'https://www.mioots.org',
        'https://taylorasprilla.dev',
        'https://www.taylorasprilla.dev',
      ];

  console.log('🌐 CORS enabled for origins:', corsOrigins);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir requests sin origin (como Postman, curl, o same-origin)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Verificar si el origin está en la lista permitida
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  // Configurar filtros globales
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar interceptores globales
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('OOTS Colombia API')
    .setDescription(
      'API para el Sistema de la Oficina de Orientación de la Congregación Mita en Colombia',
    )
    .setVersion('1.0')
    .addTag(
      'participants',
      'Gestión de participantes y sus intervenciones sociales',
    )
    .addTag('users', 'Gestión de usuarios del sistema')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  // Obtener URL base según entorno
  const appUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
  const environment = process.env.NODE_ENV || 'development';

  console.log('Application is running on:', `${appUrl}/api/v1`);
  console.log('Swagger documentation:', `${appUrl}/api/docs`);
  console.log('Environment:', environment);
  console.log('Port:', port);
}

void bootstrap();
