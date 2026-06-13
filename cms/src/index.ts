import type { Core } from '@strapi/strapi';

const DEFAULT_ADMIN_LOCALE = 'zh-Hans';

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
   *
   * - Install a `beforeCreate` lifecycle hook on `admin::user`
   *   so every newly-created admin user (via the UI registration
   *   form, or future API/scripts) automatically gets
   *   `preferedLanguage = 'zh-Hans'` unless an explicit value
   *   is provided in the request payload.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['admin::user'],
      beforeCreate(event: any) {
        if (!event.params.data?.preferedLanguage) {
          event.params.data = {
            ...event.params.data,
            preferedLanguage: DEFAULT_ADMIN_LOCALE,
          };
        }
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * - Auto-configure Public role permissions so the Next.js
   *   frontend can fetch content without an API token.
   * - Set the default admin UI language to Simplified Chinese
   *   for every existing admin user (idempotent — only updates
   *   rows whose `prefered_language` is NULL or differs from
   *   the default).
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensurePublicPermissions(strapi);
    await ensureAdminLanguage(strapi);
    await fixUserPermissions(strapi);
    await debugUserPermissions(strapi);
  },
};

async function ensureAdminLanguage(strapi: Core.Strapi) {
  // The DB column is `prefered_language` (single "r" — Strapi's typo).
  // The Strapi API name is `preferedLanguage` (camelCase).
  // `updateMany` requires the API name; `where` accepts either.
  //
  // We update every row whose `preferedLanguage` is either NULL or
  // already a non-Chinese locale (e.g. Strapi's default 'en'). Once
  // the row already equals the default locale the predicate skips it,
  // so this stays cheap on subsequent restarts.
  const updated = await strapi.db.query('admin::user').updateMany({
    where: {
      $or: [
        { preferedLanguage: { $null: true } },
        { preferedLanguage: { $ne: DEFAULT_ADMIN_LOCALE } },
      ],
    },
    data: { preferedLanguage: DEFAULT_ADMIN_LOCALE },
  });

  if (updated && updated.count > 0) {
    strapi.log.info(
      `[bootstrap] Set admin UI language to "${DEFAULT_ADMIN_LOCALE}" for ${updated.count} user(s)`,
    );
  }
}

async function fixUserPermissions(strapi: Core.Strapi) {
  // The users-permissions user content type has field-level permission
  // checkboxes. Strapi's permission engine treats {"fields":[]} as
  // "no fields allowed" and discards the permission entirely. We
  // force the list of readable fields so the read/create/update
  // actions survive the engine's `after-format::validate.permission`
  // hook.
  const fields = [
    'username',
    'email',
    'provider',
    'confirmed',
    'blocked',
    'role',
    'createdAt',
    'updatedAt',
  ];
  const result = await strapi.db.query('admin::permission').updateMany({
    where: {
      action: {
        $in: [
          'plugin::content-manager.explorer.read',
          'plugin::content-manager.explorer.create',
          'plugin::content-manager.explorer.update',
        ],
      },
      subject: 'plugin::users-permissions.user',
    },
    data: { properties: { fields } },
  });
  strapi.log.info(
    `[fix] updated ${result.count} users-permissions user permission row(s)`,
  );
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

async function debugUserPermissions(strapi: Core.Strapi) {
  const user = await strapi.db.query('admin::user').findOne({
    where: { id: 1 },
    populate: ['roles'],
  });
  if (!user) {
    strapi.log.warn('[debug] no admin user id=1 found');
    return;
  }
  strapi.log.info(
    `[debug] user id=1 email=${user.email} isActive=${user.isActive} roles=${
      (user.roles as any[]).map((r) => r.id).join(',')
    }`,
  );

  const permissionService = strapi.service('admin::permission');
  const perms = await (permissionService as any).findUserPermissions(user);
  strapi.log.info(`[debug] user has ${perms.length} permissions in DB`);

  const userPerms = perms.filter((p: any) => p.subject === 'plugin::users-permissions.user');
  for (const p of userPerms) {
    strapi.log.info(
      `[debug]   action=${p.action} props=${JSON.stringify(p.properties)}`,
    );
  }

  const engine = (permissionService as any).engine;
  const ability = await engine.generateUserAbility(user);
  const rules = (ability as any).rules as any[];
  const userRules = rules.filter(
    (r) => r.subject === 'plugin::users-permissions.user',
  );
  strapi.log.info(
    `[debug] ability rules for users-permissions.user: ${userRules.length}`,
  );
  for (const r of userRules) {
    strapi.log.info(
      `[debug]   action=${r.action} subject=${r.subject} fields=${JSON.stringify(r.fields)}`,
    );
  }
  strapi.log.info(
    `[debug] ability.can('plugin::content-manager.explorer.read', 'plugin::users-permissions.user') = ${ability.can(
      'plugin::content-manager.explorer.read',
      'plugin::users-permissions.user',
    )}`,
  );
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
