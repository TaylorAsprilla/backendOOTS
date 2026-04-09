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
      const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

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
   * Envía alerta de seguridad por nuevo inicio de sesión desde ubicación desconocida
   */
  async sendSecurityAlertEmail(
    user: User,
    loginInfo: {
      ip: string;
      city?: string;
      country?: string;
      device?: string;
      browser?: string;
      os?: string;
      risk: string;
      date: Date;
    },
  ): Promise<void> {
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      const riskLabel =
        loginInfo.risk === 'HIGH'
          ? '🚨 ALTO'
          : loginInfo.risk === 'MEDIUM'
            ? '⚠️ MEDIO'
            : '✅ BAJO';

      const location =
        [loginInfo.city, loginInfo.country].filter(Boolean).join(', ') ||
        loginInfo.ip;

      await this.mailerService.sendMail({
        to: user.email,
        subject: `Alerta de seguridad: nuevo inicio de sesión - OOTS`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
            <div style="background-color: #c0392b; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0;">
              <h1 style="margin: 0; font-size: 22px;">🔐 Alerta de Seguridad</h1>
              <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Nuevo inicio de sesión detectado</p>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 4px 4px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #333;">
                Hola <strong>${user.firstName} ${user.firstLastName}</strong>,
              </p>
              <p style="margin: 0 0 16px; color: #555;">
                Se detectó un inicio de sesión desde una <strong>ubicación nueva</strong>:
              </p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background:#f8f8f8;"><td style="padding:8px 12px; color:#555; font-size:13px;">📍 Ubicación</td><td style="padding:8px 12px; font-size:13px; font-weight:bold;">${location}</td></tr>
                <tr><td style="padding:8px 12px; color:#555; font-size:13px;">🌐 IP</td><td style="padding:8px 12px; font-size:13px;">${loginInfo.ip}</td></tr>
                <tr style="background:#f8f8f8;"><td style="padding:8px 12px; color:#555; font-size:13px;">💻 Dispositivo</td><td style="padding:8px 12px; font-size:13px;">${loginInfo.device || 'Desconocido'}</td></tr>
                <tr><td style="padding:8px 12px; color:#555; font-size:13px;">🔎 Navegador</td><td style="padding:8px 12px; font-size:13px;">${loginInfo.browser || 'Desconocido'}</td></tr>
                <tr style="background:#f8f8f8;"><td style="padding:8px 12px; color:#555; font-size:13px;">🖥️ Sistema</td><td style="padding:8px 12px; font-size:13px;">${loginInfo.os || 'Desconocido'}</td></tr>
                <tr><td style="padding:8px 12px; color:#555; font-size:13px;">📅 Fecha y hora</td><td style="padding:8px 12px; font-size:13px;">${loginInfo.date.toLocaleString('es-CO')}</td></tr>
                <tr style="background:#f8f8f8;"><td style="padding:8px 12px; color:#555; font-size:13px;">⚠️ Nivel de riesgo</td><td style="padding:8px 12px; font-size:13px; font-weight:bold;">${riskLabel}</td></tr>
              </table>
              <p style="margin: 0 0 8px; color:#555; font-size:14px;">
                ¿No fuiste tú? Cambia tu contraseña inmediatamente:
              </p>
              <a href="${appUrl}/auth/change-password"
                 style="display:inline-block; background:#c0392b; color:white; text-decoration:none; padding:10px 22px; border-radius:4px; font-size:14px;">
                Cambiar contraseña
              </a>
            </div>
          </div>`,
      });

      this.logger.log(`Alerta de seguridad enviada a: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando alerta de seguridad a ${user.email}:`,
        error,
      );
      // Never block login due to email failure
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
