import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS para permitir peticiones desde Angular
  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular development server
      'http://localhost:3000', // Si necesitas permitir desde el mismo puerto
      'http://127.0.0.1:4200', // Alternativa de localhost
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
    ],
    credentials: true, // Si necesitas enviar cookies o headers de autenticación
  });

  app.setGlobalPrefix('api/v1');

  // Configurar filtros globales
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar interceptores globales
  app.useGlobalInterceptors(new LoggingInterceptor());

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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}/api/v1`,
  );
  console.log(
    `📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

void bootstrap();
