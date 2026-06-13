import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.exmail.qq.com'),
        port: env.int('SMTP_PORT', 465),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@shuanghongtech.com'),
        defaultReplyTo: env('SMTP_USERNAME', 'noreply@shuanghongtech.com'),
      },
    },
  },
});

export default config;
