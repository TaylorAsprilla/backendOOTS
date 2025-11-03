import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const getMailConfig = (configService: ConfigService): MailerOptions => {
  return {
    transport: {
      host: configService.get('MAILER_HOST'),
      port: parseInt(configService.get('MAILER_PORT') || '587'),
      secure: false,
      auth: {
        user: configService.get('MAILER_USER'),
        pass: configService.get('MAILER_PASS'),
      },
    },
    defaults: {
      from: `${configService.get('MAILER_FROM_NAME')} <${configService.get('MAILER_FROM')}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: false,
      },
    },
  };
};
