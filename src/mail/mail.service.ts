import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

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
   */
  async sendUserRegistrationEmail(user: User): Promise<void> {
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';

      const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">🏥 OOTS Colombia</h1>
            <p style="margin: 10px 0 0 0;">Sistema de Gestión de Participantes</p>
          </div>
          
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">¡Hola ${user.firstName} ${user.firstLastName}! 👋</h2>
              <p>¡Te damos la más cordial bienvenida a <strong>OOTS Colombia</strong>!</p>
              <p>Tu cuenta ha sido creada exitosamente el <strong>${new Date().toLocaleDateString(
                'es-CO',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}</strong> y ya puedes acceder a nuestro sistema.</p>
            </div>
            
            <div style="background-color: #fff9e6; padding: 15px; border-radius: 8px; border: 1px solid #ffd633; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">📧 Datos de tu cuenta:</h3>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Organización:</strong> ${user.organization || 'OOTS Colombia'}</p>
              <p style="font-size: 14px; color: #666;">Puedes iniciar sesión usando tu email y la contraseña que estableciste durante el registro.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                🚀 Acceder al Sistema
              </a>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">📋 ¿Qué puedes hacer en OOTS Colombia?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Gestionar participantes y sus datos biopsicosociales</li>
                <li>Crear y seguir casos de intervención</li>
                <li>Acceder a catálogos de información especializada</li>
                <li>Generar reportes y estadísticas</li>
                <li>Colaborar con otros profesionales del equipo</li>
              </ul>
            </div>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>
            <p>¡Esperamos que tengas una excelente experiencia usando OOTS Colombia!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p><strong>OOTS Colombia</strong> - Organización Obrera Tienda de Salud</p>
            <p>Sistema de Gestión de Participantes en Programas de Bienestar y Salud Mental</p>
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a esta dirección.</p>
          </div>
        </div>
      `;

      await this.mailerService.sendMail({
        to: user.email,
        subject: '¡Bienvenido a OOTS Colombia!',
        html: welcomeHtml,
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
        subject: 'Recuperación de contraseña - OOTS Colombia',
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
        subject: 'Correo de prueba simple - OOTS Colombia',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px;">
              <h1>✅ Prueba de Correo Exitosa</h1>
              <p>OOTS Colombia - Sistema de Correos</p>
            </div>
            <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 8px;">
              <h2>🎉 ¡Sistema de correo funcionando!</h2>
              <p>Este es un correo de prueba enviado el: <strong>${new Date().toLocaleString('es-CO')}</strong></p>
              <p>Si recibes este correo, la configuración SMTP está funcionando correctamente.</p>
              <ul>
                <li>✅ Configuración SMTP activa</li>
                <li>✅ Autenticación exitosa</li>
                <li>✅ Envío de correos operativo</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>OOTS Colombia - Sistema de Correos Electrónicos</p>
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
        subject: 'Correo de prueba - OOTS Colombia',
        template: 'test',
        context: {
          mensaje: 'Este es un correo de prueba del sistema OOTS Colombia',
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
