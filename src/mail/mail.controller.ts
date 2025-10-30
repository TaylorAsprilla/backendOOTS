import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Correo Electrónico')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('test')
  @ApiOperation({ summary: 'Enviar correo de prueba' })
  @ApiResponse({
    status: 200,
    description: 'Correo de prueba enviado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al enviar el correo',
  })
  async sendTestEmail(@Body('email') email: string) {
    try {
      await this.mailService.sendTestEmail(email);
      return {
        message: 'Correo de prueba enviado exitosamente',
        sentTo: email,
      };
    } catch (error) {
      return {
        message: 'Error al enviar el correo de prueba',
        error: (error as Error).message,
      };
    }
  }

  @Public()
  @Get('test-simple')
  @ApiOperation({ summary: 'Enviar correo de prueba simple' })
  @ApiQuery({ name: 'email', description: 'Email de destino' })
  @ApiResponse({
    status: 200,
    description: 'Correo de prueba enviado exitosamente',
  })
  async sendSimpleTestEmail(@Query('email') email: string) {
    try {
      await this.mailService.sendSimpleTestEmail(email);
      return {
        message: 'Correo de prueba simple enviado exitosamente',
        sentTo: email,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Error al enviar el correo de prueba simple',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Get('test-with-template')
  @ApiOperation({ summary: 'Enviar correo de prueba con plantilla' })
  @ApiQuery({ name: 'email', description: 'Email de destino' })
  @ApiResponse({
    status: 200,
    description: 'Correo de prueba enviado exitosamente',
  })
  async sendTestEmailWithTemplate(@Query('email') email: string) {
    try {
      await this.mailService.sendTestEmail(email);
      return {
        message: 'Correo de prueba con plantilla enviado exitosamente',
        sentTo: email,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Error al enviar el correo de prueba con plantilla',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
