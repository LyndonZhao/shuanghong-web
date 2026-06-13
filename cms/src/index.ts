import type { Core } from '@strapi/strapi';

const PUBLIC_READ_TYPES = [
  'api::home-page.home-page',
  'api::multimodal-page.multimodal-page',
  'api::ai-application-page.ai-application-page',
  'api::about-page.about-page',
  'api::solution.solution',
  'api::site-setting.site-setting',
] as const;

const PUBLIC_CREATE_TYPES = ['api::inquiry.inquiry'] as const;

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * - Auto-configure Public role permissions so the Next.js
   *   frontend can fetch content without an API token.
   * - Set the default admin UI language to Simplified Chinese
   *   for every admin user (idempotent — skips users who
   *   already have a non-empty `prefered_language`).
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensurePublicPermissions(strapi);
    await ensureAdminLanguage(strapi);
  },
};

const DEFAULT_ADMIN_LOCALE = 'zh-Hans';

async function ensureAdminLanguage(strapi: Core.Strapi) {
  // The DB column is `prefered_language` (single "r" — Strapi's typo).
  // The Strapi API name is `preferedLanguage` (camelCase).
  // `updateMany` requires the API name; `where` accepts either.
  const updated = await strapi.db
    .query('admin::user')
    .updateMany({
      where: { preferedLanguage: { $null: true } },
      data: { preferedLanguage: DEFAULT_ADMIN_LOCALE },
    });

  if (updated && updated.count > 0) {
    strapi.log.info(
      `[bootstrap] Set admin UI language to "${DEFAULT_ADMIN_LOCALE}" for ${updated.count} user(s)`,
    );
  }
}

async function ensurePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found, skipping permission setup');
    return;
  }

  for (const action of PUBLIC_READ_TYPES) {
    await grantAction(strapi, publicRole.id as number, `${action}.find`);
    await grantAction(strapi, publicRole.id as number, `${action}.findOne`);
  }

  for (const action of PUBLIC_CREATE_TYPES) {
    await grantAction(strapi, publicRole.id as number, `${action}.create`);
  }

  strapi.log.info('[bootstrap] Public role permissions configured');
}

async function grantAction(strapi: Core.Strapi, roleId: number, action: string) {
  const existing = await strapi.db
    .query('plugin::users-permissions.permission')
    .findOne({ where: { action, role: roleId } });

  if (existing) return;

  await strapi.db.query('plugin::users-permissions.permission').create({
    data: { action, role: roleId },
  });
}
