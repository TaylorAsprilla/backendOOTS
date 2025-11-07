import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { join } from 'path';

export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía un correo de bienvenida al usuario recién registrado
   * @param user Usuario registrado
   * @param password Contraseña original del usuario (sin hashear)
   */
  async sendUserRegistrationEmail(user: User, password: string): Promise<void> {
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      const logoPath: string = join(
        __dirname,
        '..',
        '..',
        'src',
        'assets',
        'images',
        'logo.png',
      );
      const fechaRegistro = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Bienvenido a OOTS',
        template: 'welcome',
        context: {
          nombre: `${user.firstName} ${user.firstLastName}`,
          email: user.email,
          password: password,
          fechaRegistro: fechaRegistro,
          url: appUrl,
        },
        attachments: [
          {
            filename: 'logo.png',
            path: logoPath,
            cid: 'logo',
          },
        ],
      });

      this.logger.log(`Correo de bienvenida enviado a: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando correo de bienvenida a ${user.email}:`,
        error.stack,
      );
      // No lanzamos el error para que no afecte el registro del usuario
    }
  }

  /**
   * Envía un correo de recuperación de contraseña
   * @param user Usuario que solicita recuperación
   * @param resetToken Token de recuperación
   */
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Recuperación de contraseña - OOTS',
        template: 'password-reset',
        context: {
          nombre: `${user.firstName} ${user.firstLastName}`,
          resetUrl,
          expirationTime: '24 horas',
        },
      });

      this.logger.log(`Correo de recuperación enviado a: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando correo de recuperación a ${user.email}:`,
        error.stack,
      );
      throw error; // En este caso sí lanzamos el error porque es crítico
    }
  }

  /**
   * Envía un correo de notificación general
   * @param options Opciones del correo
   */
  async sendNotificationEmail(options: SendMailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });

      this.logger.log(`Correo de notificación enviado a: ${options.to}`);
    } catch (error) {
      this.logger.error(
        `Error enviando correo de notificación a ${options.to}:`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Método para pruebas de envío de correo SIN plantilla
   */
  async sendSimpleTestEmail(to: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Correo de prueba simple - OOTS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0 0 5px 0; font-size: 24px;">Prueba de Correo Exitosa</h1>
              <p style="margin: 0; font-size: 14px; color: #e0e0e0;">OOTS - Sistema de Correos</p>
            </div>
            <div style="background-color: white; padding: 20px; margin-top: 20px; border: 1px solid #e0e0e0;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #333;">Sistema de correo funcionando</h2>
              <p style="color: #666;">Este es un correo de prueba enviado el: <strong>${new Date().toLocaleString('es-CO')}</strong></p>
              <p style="color: #666;">Si recibes este correo, la configuración SMTP está funcionando correctamente.</p>
              <ul style="color: #666;">
                <li>Configuración SMTP activa</li>
                <li>Autenticación exitosa</li>
                <li>Envío de correos operativo</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              <p>OOTS - Sistema de Correos Electrónicos</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`Correo de prueba simple enviado a: ${to}`);
    } catch (error) {
      this.logger.error(
        `Error enviando correo de prueba simple a ${to}:`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Método para pruebas de envío de correo
   */
  async sendTestEmail(to: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Correo de prueba - OOTS',
        template: 'test',
        context: {
          mensaje: 'Este es un correo de prueba del sistema OOTS',
          fecha: new Date().toLocaleString('es-CO'),
        },
      });

      this.logger.log(`Correo de prueba enviado a: ${to}`);
    } catch (error) {
      this.logger.error(
        `Error enviando correo de prueba a ${to}:`,
        error.stack,
      );
      throw error;
    }
  }
}
