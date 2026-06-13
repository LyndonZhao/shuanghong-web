import type { StrapiApp } from '@strapi/strapi/admin';

/**
 * Strapi 5 admin panel extension.
 *
 * `config.locales` controls which languages are available in each
 * admin user's Profile page → Language selector. We include:
 *   - `zh-Hans`: Simplified Chinese (default for this project)
 *   - `en`:      English (fallback)
 *
 * To set the default for an existing admin user, set the
 * `prefered_language` column on `admin_users` (yes, Strapi spells it
 * "prefered" — single "r"). The bootstrap function in `src/index.ts`
 * does this automatically on every Strapi boot, so new admin users
 * created via the UI will also default to Chinese.
 */
export default {
  config: {
    locales: ['zh-Hans', 'en'],
  },
  bootstrap(_app: StrapiApp) {
    // Reserved for future admin customisations (menu items, plugins, etc.)
  },
};
