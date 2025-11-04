import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@Controller()
@ApiTags('root')
export class AppController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check y bienvenida' })
  @ApiResponse({ status: 200, description: 'API funcionando correctamente' })
  getRoot() {
    return {
      status: 'ok',
      message: 'OOTS Colombia API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        api: '/api/v1',
        docs: '/api/docs',
        health: '/health',
      },
    };
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Servicio saludable' })
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
