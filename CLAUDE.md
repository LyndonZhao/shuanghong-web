# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

双泓科技官网 (shuanghongtech.com) — corporate site for Shanghai Shuanghong Info Tech.
**Stack:** Next.js 16 (frontend, port 3000) + Strapi 5.48 (CMS, port 1337) + SQLite + Tailwind 4 + fuse.js (client search) + Cloudflare Turnstile (form spam protection).

Deploys to a single Volcengine ECS box (Ubuntu 22.04) behind Nginx + PM2; CI/CD via GitHub Actions SSH.

```
shuanghong-web/
├── web/      Next.js 16 frontend (App Router, RSC, ISR)
├── cms/      Strapi 5 backend (admin UI at /admin, REST at /api)
├── deploy/   Nginx site config, PM2 ecosystem, server bootstrap script
└── docs/     OPERATIONS_MANUAL.md (运营) · DEVELOPER_GUIDE.md (开发/管理员) · ICP-DNS-CHECKLIST.md
```

## ⚠️ Critical: Next.js 16 has breaking changes

APIs, conventions, and file structure differ from training data. **Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.** Heed deprecation notices (e.g. `params`/`searchParams` are now async `Promise<...>` in pages and layouts).

## Common Commands

### Dev (two terminals)

```bash
# Terminal 1 — Strapi (admin auto-reload)
cd cms && npm install && npm run develop     # http://localhost:1337/admin

# Terminal 2 — Next.js
cd web && npm install && npm run dev         # http://localhost:3000
```

### Web (`web/`)

```bash
npm run dev                  # next dev
npm run build                # next build (production)
npm run start                # next start
npm run lint                 # eslint
npm test                     # vitest run (all unit tests)
npx vitest run lib/strapi.test.ts            # single test file
npx vitest run -t "strapiFetch"              # single test by name
npm run test:watch           # vitest --watch
npm run test:coverage        # v8 coverage; thresholds 80/80/75/80 lines/fn/branches/stmts
npm run test:e2e             # playwright (boots `npm start` on :3001)
npm run test:e2e:install     # one-time browser install
npx tsc --noEmit             # type check
```

### CMS (`cms/`)

```bash
npm run develop              # strapi develop (auto-reload admin)
npm run start                # strapi start (production mode)
npm run build                # strapi build (admin panel bundle)
npm run upgrade:dry          # preview Strapi 5 upgrade
npx tsx scripts/seed.ts      # idempotent seed: 9 solutions + 4 single-types + site setting
npx tsc --noEmit             # type check
```

CI runs (`.github/workflows/deploy.yml`): `cd web && npx vitest run --coverage && npm run lint && npx tsc --noEmit`, then `cd cms && npx tsc --noEmit`.

## Architecture

### Frontend (`web/`)

- **App Router** at `app/`: `page.tsx` (home), `about/`, `multimodal/`, `ai-application/`, `login/`, `api/inquiry/route.ts` (POST → forwards to Strapi `/api/inquiries` with Turnstile verification).
- **`lib/`** is the data boundary:
  - `strapi.ts` — `strapiFetch<T>()` with ISR (`revalidate: 60` default), optional cache `tags`, Bearer token via `STRAPI_API_TOKEN`.
  - `data.ts` — typed wrappers (`getHomePage`, `getAllSolutions`, `getSolutionsByCategory`, `getSiteSetting`, etc.) used by RSC pages.
  - `types.ts` — single source of truth mirroring `cms/src/api/*/schema.json` (Strapi 5 envelope: `{ id, documentId, attributes, publishedAt }`).
  - `search.ts` — builds fuse.js index from solutions + static pages (used by Cmd+K palette).
- **`components/`** — `Header`, `Footer`, `InquiryForm` (client), `CommandPalette` (client, Cmd+K), `SearchTrigger`, `AnalyticsInjector`, `SolutionGrid`.
- **Aliases:** `@/*` → repo root of `web/` (see `tsconfig.json` and `vitest.config.ts`).
- **SEO:** `app/sitemap.ts`, `app/robots.ts`.

### Backend (`cms/`)

- **Content types** under `cms/src/api/`. Single types: `home-page`, `multimodal-page`, `ai-application-page`, `about-page`. Collection types: `solution`, `inquiry`, `site-setting`. Shared **components** under `cms/src/components/`: `seo`, `contact`.
- **Bootstrap** (`cms/src/index.ts`) runs four idempotent tasks on every start:
  1. `ensureAdminLanguage` — sets `preferedLanguage='zh-Hans'` for any admin user not already on it (Strapi column typo: `prefered_language`).
  2. `ensurePublicPermissions` — grants `find`/`findOne` on all read-only types and `create` on `api::inquiry.inquiry` to the Public role, so the Next.js frontend can fetch unauthenticated.
  3. `fixUserPermissions` — force-set `properties.fields` on `plugin::users-permissions.user` content-manager permissions (Strapi's permission engine treats empty `fields` as "no access" and drops the row).
  4. `debugUserPermissions` — logs user/permission state for the first admin user (safe to remove after confirming production works).
- **`register()`** lifecycle hook: seeds `preferedLanguage='zh-Hans'` on every new admin user via `admin::user` `beforeCreate`.
- **Admin UI customization** (`cms/src/admin/app.tsx`):
  - Locales = `['zh-Hans', 'en']`. Project-local translation overrides at `cms/src/admin/translations/zh-Hans.json` fill ~960 strings missing from Strapi's built-in bundle.
  - `bootstrap()` seeds `localStorage['strapi-admin-language']='zh-Hans'` on first visit, then reloads once so `StrapiApp.render()` picks it up (Strapi reads from localStorage, not the `admin_users.prefered_language` column directly).
  - `HIDDEN_NAV_RULES` injects CSS to hide **Users** (content-manager submenu — `wrapLi: false` to avoid nuking parent "集合类型" group), **Marketplace**, and **Deploy** (Strapi Cloud entry, only visible in dev). UI-only hide — routes/plugins intact.
- **Config:** `config/server.ts` binds `127.0.0.1:1337`, `config/database.ts` SQLite with `pool: {min:0,max:1}` + WAL (single connection), `config/plugins.ts` Nodemailer SMTP (qq exmail default), `config/middlewares.ts` standard Strapi stack.

### Inquiry form flow

`web/components/InquiryForm.tsx` (client) → `POST /api/inquiry` (`web/app/api/inquiry/route.ts`) — validates payload, verifies Cloudflare Turnstile if `TURNSTILE_SECRET` is set, forwards to `POST ${STRAPI_URL}/api/inquiries`. CORS allows the Next.js origin via `CORS_ORIGINS` in `cms/.env`.

### Deployment

- GitHub Actions: `test` job runs on every push; `deploy` job (only `main`) rsyncs the tree, runs `npm ci && npm run build` for `web/`, `npm ci` for `cms/`, then `pm2 reload ecosystem.config.cjs` (no-downtime).
- `deploy/ecosystem.config.cjs` defines two PM2 apps: `shuanghong-cms` (port 1337) and `shuanghong-web` (port 3000). Secrets are interpolated from the host environment.
- `deploy/setup-server.sh` is the one-shot Ubuntu 22.04 bootstrap (Node 20 via nvm, PM2, Nginx, Certbot, app user, repo clone). Idempotent.
- `deploy/nginx.conf.example` terminates SSL, proxies `/admin` and `/api` to Strapi:1337, default to Next.js:3000, with HSTS + security headers.
- Required GitHub repo secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, optional `WEBHOOK_URL`.
- SQLite lives at `cms/.cms/db/data.db` (tracked in git, not gitignored — deploys ship the latest content state). Back up via cron (see `deploy/README.md`).
- ICP filing + DNS A-record procedure is in `docs/ICP-DNS-CHECKLIST.md` (required for Chinese hosting).

### Env vars

`cms/.env` (template at `.env.example`): `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`, `DATABASE_*`, `SMTP_*`, `CORS_ORIGINS`. PM2 injects `SMTP_*` per-app; production `ecosystem.config.cjs` references `${VAR}` placeholders that PM2 expands from the host shell.

Web env (read by `lib/strapi.ts`, `next.config.ts`, `app/api/inquiry/route.ts`): `STRAPI_URL` (default `http://127.0.0.1:1337`), `STRAPI_API_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `TURNSTILE_SECRET`, `REVALIDATE_SECRET`.

## Documentation split

- `docs/OPERATIONS_MANUAL.md` — for 运营/编辑 (content editors). Login, content types, inquiry handling, media library, SEO fields, FAQ.
- `docs/DEVELOPER_GUIDE.md` — for 开发工程师/管理员. Hidden menus, roles, API tokens, webhooks, content-type field reference, version/maintenance.
- `docs/ICP-DNS-CHECKLIST.md` — domain + 备案 procedure before going live in China.

Read these before assuming what the project supports — they encode business decisions (e.g. why `users-permissions` UI is hidden, why public role is pre-configured).

## Testing

- **Vitest** (jsdom, globals, `@/` alias, coverage with v8) — colocated `*.test.ts`/`*.test.tsx` next to source. Threshold gate in `vitest.config.ts`.
- **Playwright** at `tests/e2e/` — boots `next start` on :3001 in CI, reuses local server otherwise. Currently `home.spec.ts` only; add new specs alongside.
- **CI gate** is the source of truth — match it locally before pushing.