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

      const welcomeHtml = `
        <html lang='es'>
          <head>
            <meta charset='UTF-8' />
            <meta name='viewport' content='width=device-width, initial-scale=1.0' />
            <title>Bienvenido a OOTS</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
              }
              .header {
                padding: 40px 30px;
                text-align: center;
                border-bottom: 1px solid #e0e0e0;
              }
              .logo {
                max-width: 150px;
                height: auto;
                margin-bottom: 10px;
              }
              .header-subtitle {
                color: #666;
                font-size: 14px;
                margin: 10px 0 0 0;
              }
              .content {
                padding: 30px;
              }
              .welcome-text {
                font-size: 16px;
                margin-bottom: 20px;
                color: #333;
              }
              .credentials-box {
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                padding: 20px;
                margin: 25px 0;
              }
              .credentials-box h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #333;
                font-weight: 600;
              }
              .credential-item {
                margin: 10px 0;
                font-size: 14px;
              }
              .credential-label {
                color: #666;
                display: inline-block;
                width: 100px;
              }
              .credential-value {
                color: #333;
                font-weight: 500;
              }
              .security-note {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
                color: #d32f2f;
                font-size: 13px;
              }
              .button {
                display: inline-block;
                background-color: #333;
                color: #ffffff;
                padding: 12px 30px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                margin: 25px 0;
                border: 1px solid #333;
              }
              .info-section {
                margin: 25px 0;
                padding: 20px;
                border-left: 2px solid #333;
                background-color: #fafafa;
              }
              .info-section h3 {
                margin: 0 0 12px 0;
                font-size: 15px;
                color: #333;
                font-weight: 600;
              }
              .info-section ul {
                margin: 0;
                padding-left: 20px;
              }
              .info-section li {
                margin: 8px 0;
                font-size: 14px;
                color: #555;
              }
              .footer {
                text-align: center;
                padding: 25px 30px;
                border-top: 1px solid #e0e0e0;
                background-color: #fafafa;
              }
              .footer p {
                margin: 8px 0;
                color: #666;
                font-size: 13px;
              }
              .footer-note {
                color: #999;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class='container'>
              <div class='header'>
                <img src='cid:logo' alt='OOTS Logo' class='logo' />
                <p class='header-subtitle'>Sistema de Gestión de Participantes</p>
              </div>

              <div class='content'>
                <div class='welcome-text'>
                  <h2 style='margin: 0 0 15px 0; font-size: 20px; color: #333; font-weight: 600;'>Hola ${user.firstName} ${user.firstLastName}</h2>
                  <p>Te damos la bienvenida a OOTS. Tu cuenta ha sido creada exitosamente el <strong>${fechaRegistro}</strong>.</p>
                </div>

                <div class='credentials-box'>
                  <h3>Credenciales de acceso</h3>
                  <div class='credential-item'>
                    <span class='credential-label'>Usuario:</span>
                    <span class='credential-value'>${user.email}</span>
                  </div>
                  <div class='credential-item'>
                    <span class='credential-label'>Contraseña:</span>
                    <span class='credential-value'>${password}</span>
                  </div>
                  <div class='security-note'>
                    Por tu seguridad, te recomendamos cambiar tu contraseña después del primer ingreso.
                  </div>
                </div>

                <div style='text-align: center;'>
                  <a href='${appUrl}/login' class='button'>Acceder al Sistema</a>
                </div>

                <div class='info-section'>
                  <h3>¿Qué puedes hacer en OOTS?</h3>
                  <ul>
                    <li>Gestionar participantes y sus datos biopsicosociales</li>
                    <li>Crear y seguir casos de intervención</li>
                    <li>Generar reportes y estadísticas</li>
                    <li>Colaborar con otros profesionales del equipo</li>
                  </ul>
                </div>

                <div class='info-section'>
                  <h3>Consejos de seguridad</h3>
                  <ul>
                    <li>Mantén tu contraseña segura y no la compartas</li>
                    <li>Cierra sesión al terminar de usar el sistema</li>
                    <li>Contacta al soporte si detectas alguna actividad sospechosa</li>
                  </ul>
                </div>

                <p style='color: #666; font-size: 14px; margin-top: 25px;'>
                  Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.
                </p>
              </div>

              <div class='footer'>
                <p><strong>OOTS</strong> - Oficina de Orientación y Trabajo Social de la Congregación Mita</p>
                <p>Sistema de Gestión de Participantes</p>
                <p class='footer-note'>
                  Este es un correo automático, por favor no respondas a esta dirección.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Bienvenido a OOTS',
        html: welcomeHtml,
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
