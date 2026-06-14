/**
 * PM2 process manager config.
 * Run with: pm2 start deploy/ecosystem.config.cjs
 * Persist across reboots: pm2 save && pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'shuanghong-cms',
      cwd: '../cms',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 1337,
        APP_KEYS: '${APP_KEYS}',
        API_TOKEN_SALT: '${API_TOKEN_SALT}',
        ADMIN_JWT_SECRET: '${ADMIN_JWT_SECRET}',
        TRANSFER_TOKEN_SALT: '${TRANSFER_TOKEN_SALT}',
        JWT_SECRET: '${JWT_SECRET}',
        ENCRYPTION_KEY: '${ENCRYPTION_KEY}',
        DATABASE_CLIENT: 'sqlite',
        DATABASE_FILENAME: '.cms/db/data.db',
        CORS_ORIGINS: 'https://shuanghongtech.com',
        SMTP_HOST: '${SMTP_HOST}',
        SMTP_PORT: '${SMTP_PORT}',
        SMTP_USERNAME: '${SMTP_USERNAME}',
        SMTP_PASSWORD: '${SMTP_PASSWORD}',
        SMTP_FROM: '${SMTP_FROM}',
        SMTP_TO: '${SMTP_TO}',
      },
      max_memory_restart: '500M',
      instances: 1,
      autorestart: true,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/shuanghong/cms-error.log',
      out_file: '/var/log/shuanghong/cms-out.log',
    },
    {
      name: 'shuanghong-web',
      cwd: '../web',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        STRAPI_URL: 'http://127.0.0.1:1337',
        NEXT_PUBLIC_SITE_URL: 'https://shuanghongtech.com',
        TURNSTILE_SECRET: '${TURNSTILE_SECRET}',
        REVALIDATE_SECRET: '${REVALIDATE_SECRET}',
      },
      max_memory_restart: '500M',
      instances: 1,
      autorestart: true,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/shuanghong/web-error.log',
      out_file: '/var/log/shuanghong/web-out.log',
    },
  ],
};
