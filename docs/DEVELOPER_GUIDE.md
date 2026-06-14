# 双泓科技官网后台 — 技术开发与管理员指南

> 适用对象:开发工程师、超级管理员
> 配套文档:日常运营人员看 [`OPERATIONS_MANUAL.md`](./OPERATIONS_MANUAL.md)
> 项目位置:`/root/github/shuanghong-web/`
> 适用版本:Strapi 5.48.0 · 中文界面 · SQLite 本地数据库

---

## 目录

1. [角色与账号管理](#角色与账号管理)
2. [已经永久隐藏的左侧菜单](#已经永久隐藏的左侧菜单)
3. [后台角色(Admin Roles)](#后台角色admin-roles)
4. [邀请 / 禁用 / 删除管理员](#邀请--禁用--删除管理员)
5. [修改密码与账号安全](#修改密码与账号安全)
6. [公开 API 权限(Public Role)](#公开-api-权限public-role)
7. [API 令牌与 Webhook](#api-令牌与-webhook)
8. [内容类型字段速查表](#内容类型字段速查表)
9. [版本与维护](#版本与维护)

---

## 角色与账号管理

> 运营/编辑用户的日常操作见 [`OPERATIONS_MANUAL.md`](./OPERATIONS_MANUAL.md)。本节是**管理员(Super Admin)** 视角:开账号、改角色、撤账号、调权限。

---

## 已经永久隐藏的左侧菜单

为了让运营人员的界面更聚焦,以下菜单已通过 `cms/src/admin/app.tsx` 的
`HIDDEN_NAV_RULES` 数组 + CSS 注入做**纯前端隐藏**:

| 隐藏的菜单 | 匹配方式 | 理由 |
|---|---|---|
| **内容管理器 → 用户** | `a[href*="plugin::users-permissions.user"]` | 本项目不开前端注册;表常年 0 条;无任何业务关联 |
| **市场(Marketplace)** | `[aria-label="市场"]` / `"Marketplace"` | 运营不应有权浏览/安装插件;插件变更必须由开发评审走 `package.json` |
| **部署(Deploy)** | `[aria-label="部署"]` / `"Deploy"` | `@strapi/plugin-cloud` 的 Strapi Cloud 部署入口;本项目自部署,不走云端,运营也不应触发部署 |

### 技术细节

```ts
// cms/src/admin/app.tsx
type HideRule = { selector: string; wrapLi?: boolean };

const HIDDEN_NAV_RULES: HideRule[] = [
  // 用户菜单:嵌套结构,绝不能 wrapLi:true,否则会把"集合类型"父分组一起隐
  { selector: 'a[href*="plugin::users-permissions.user"]', wrapLi: false },

  // 主 nav 的一级菜单(平铺 <ul>,wrapLi 安全)
  { selector: '[aria-label="市场"]',      wrapLi: true },
  { selector: '[aria-label="Marketplace"]', wrapLi: true },
  { selector: '[aria-label="部署"]',      wrapLi: true },
  { selector: '[aria-label="Deploy"]',     wrapLi: true },
];
```

### 关键设计点

- **`wrapLi` 开关**:`true` 同时加 `li:has(...)` 让外层 `<li>` 也消失;
  `false` 只隐元素自身,避免 `:has()` 误伤嵌套结构的父分组。
- **`aria-label` 匹配**:Strapi 5 的 `MainNav/MainNavLinks.mjs` 第 88 行
  硬编码了 `aria-label={labelValue}`,值就是 i18n 后的菜单文字。
  中文环境用中文 selector,加一条英文 selector 兜底切换 locale 时仍生效。
- **CSS `:has()` 兼容**:Chrome 105+ / Firefox 121+ / Safari 15.4+,
  均在 Strapi 5 官方浏览器支持范围内。
- 仅 **UI 层隐藏**,后端路由 / API / 插件全部保留 ——
  开发同事改 URL 直接访问 `/admin/marketplace` 或 `/admin/plugins/cloud` 仍可进入。
- 想新增隐藏菜单:在 `HIDDEN_NAV_RULES` 加一行(Vite 热更新立即生效)。
- 想恢复显示:删除对应那一行(同样立即生效)。

### ⚠️ 重要:不要卸载这两个插件

> ⚠️ **不要卸载 `@strapi/plugin-users-permissions` 插件本身** —— `cms/src/index.ts` 的
> `ensurePublicPermissions()` 依赖此插件提供的 `plugin::users-permissions.role` 表
> 来给前端站点开放页面读权限 + 询盘提交权限。卸载会导致**整个对外 API 403**。
>
> ⚠️ **`@strapi/plugin-cloud` 也保留**(仅隐 UI),否则 `package.json` 锁的
> 版本约束可能在升级时报错。

### 未来要做用户登录时,需做三步

1. 从 `HIDDEN_NAV_RULES` 移除 `'plugin::users-permissions.user'` 那条(重新显示菜单)。
2. 在「设置 → USERS & PERMISSIONS PLUGIN → 角色 → Public」开启 `Auth.callback / register`。
3. 在前端 Next.js 项目里实现注册/登录 UI 并调用 `/api/auth/local/register`、`/api/auth/local`。

---

## 后台角色(Admin Roles)

系统内置 3 个角色:

| 角色 | 英文 | 能做什么 | 当前人数 |
|---|---|---|---|
| **超级管理员** | Super Admin | 全部权限,包括用户/角色/插件/数据库连接配置 | 1 |
| **编辑** | Editor | 管理所有内容(包括他人创建的)+ 发布;不能改设置 | 0 |
| **作者** | Author | 只能管理**自己创建**的内容;不能发布他人内容 | 0 |

> 💡 建议给运营人员分配 **Editor** 角色,既能干所有内容工作,又不会误改设置。

---

## 邀请 / 禁用 / 删除管理员

### 邀请新管理员

1. **设置 → 管理员用户 → 「邀请新用户」**。
2. 填邮箱、姓、名,选「角色」。
3. **复制**邀请链接,发给本人(系统不自动发邮件,需要管理员手动转发)。
4. 对方点链接 → 设密码 → 即可登录。
5. 默认界面自动是**简体中文**(项目已在 `register()` 钩子里强制设置)。

### 禁用 / 删除

- **禁用**:设置 → 管理员用户 → 选某人 → 「已激活」开关关掉。可恢复。
- **删除**:右上角「删除」。⚠️ 删除前确认其名下没有重要询盘的 `handledBy` 引用。

---

## 修改密码与账号安全

- 右上角头像 → 「资料设置」 → 改密码部分 → 「保存」。
- 密码要求:**至少 8 位,含大小写字母 + 数字 + 特殊字符**(如 `Abc123!@`)。

---

## 公开 API 权限(Public Role)

**设置 → USERS & PERMISSIONS PLUGIN → 角色 → Public**。

这里勾选的接口允许**任何人**(包括前端 Next.js 站点、爬虫)直接调用 — **不需要 API Token**。

### 当前 bootstrap() 已自动配置的权限

⚠️ **本项目已在 `cms/src/index.ts` 的 `bootstrap()` 中自动给 Public 角色配置好以下权限**:

- **读**:`home-page`、`multimodal-page`、`ai-application-page`、`about-page`、`solution`、`site-setting` 的 `find` / `findOne`
- **写**:`inquiry` 的 `create`(让访客能提交询盘表单)

**不要随便加新的权限**(尤其是 update / delete),会导致**任何人都能改数据**。
如果误改,**重启 Strapi 服务**(`yarn develop`)会**重新执行 bootstrap 把权限重置**。

---

## API 令牌与 Webhook

### 已存在的 API 令牌

**设置 → API 令牌**。当前有 2 个:

| 名称 | 类型 | 用途 |
|---|---|---|
| Full Access | 完全访问 | 后台脚本/数据迁移 |
| Read Only | 只读 | 第三方系统读数据 |

### 何时需要创建新令牌?

- 给某个第三方系统(如数据看板、自动化脚本)开放只读访问。
- ⚠️ **永远不要**把 Full Access 令牌粘到代码仓库、聊天工具、邮件里。

### 创建新令牌步骤

1. 「**创建新的 API 令牌**」。
2. 填名称(如 `Analytics Dashboard - Read Only`)、描述。
3. **令牌类型**:推荐选「**只读**」。
4. **过期时间**:推荐 **30 天 / 90 天**,定期轮换。
5. 「保存」→ **立即复制**显示的 Token 字符串(只显示一次!)。
6. 把 Token 安全交付给使用方(走 1Password / 企业密管,**不发邮件**)。

### Webhook(可选)

**设置 → Webhook**。当前数量:**0**。

Webhook 用于**当内容发生变化时,自动通知外部系统**。常见场景:

- 新询盘创建 → 推送到企微/钉钉群(可作为邮件通知的补充)。
- 解决方案更新 → 触发前端 Next.js 重新构建。

如有需求,联系开发同事配置(需要外部接收方提供 URL + 签名密钥)。

---

## 内容类型字段速查表

> 完整定义见各 `cms/src/api/<name>/content-types/<name>/schema.json`

### 单类型

```
home-page (首页)
  ├── heroTitleLine1: string, required
  ├── heroTitleLine2: string, required
  ├── heroSubtitle: richtext
  ├── ctaPrimaryLabel: string
  ├── ctaPrimaryLink: string
  ├── ctaSecondaryLabel: string
  ├── ctaSecondaryLink: string
  ├── heroBackground: media (images, single)
  └── seo: component (seo.meta)

multimodal-page (多模态交互)
  ├── coreAdvantageTitle: string
  ├── coreAdvantageDesc: richtext
  ├── solutions: relation (oneToMany → solution)
  └── seo: component (seo.meta)

ai-application-page (AI 应用)
  ├── coreAdvantageTitle: string
  ├── coreAdvantageDesc: richtext
  ├── solutions: relation (oneToMany → solution)
  └── seo: component (seo.meta)

about-page (关于我们)
  ├── pageTitle: string
  ├── visionTitle: string
  ├── visionContent: richtext
  ├── contact: component (contact.info)
  └── seo: component (seo.meta)
```

### 集合类型

```
solution (解决方案)
  ├── title: string, required, UNIQUE
  ├── category: enum [multimodal | ai_application], required
  ├── description: richtext
  ├── coverImage: media (images, single)
  ├── slug: uid (auto from title)
  ├── order: integer (default 0)
  ├── tags: json
  └── seo: component (seo.meta)

inquiry (询盘)
  ├── name: string, required, ≤50
  ├── company: string, required, ≤100
  ├── email: email, required
  ├── phone: string
  ├── interest: enum [multimodal | ai | other] (default other)
  ├── message: text, required, ≤1000
  ├── sourcePage: string
  ├── status: enum [pending | processing | contacted | closed] (default pending)
  ├── handledBy: relation (manyToOne → admin::user)
  ├── handledAt: datetime
  └── notes: text

site-setting (站点设置)
  ├── logo: media (images, single)
  ├── logoSubtitle: string
  ├── navMenu: json
  ├── footerText: richtext
  ├── icpNumber: string
  ├── analyticsBaidu: text
  ├── analyticsGa: string
  └── contactEmailTo: email
```

### 组件

```
seo.meta
  ├── title: string, required, ≤60
  ├── description: string, ≤160
  ├── keywords: string
  └── ogImage: media (images, single)

contact.info
  ├── phone: string (default "0XX-XXXXXXXX")
  ├── email: email (default "contact@shuanghongtech.com")
  ├── address: string
  └── wechatId: string
```

---

## 版本与维护

- 文档生成时间:2026-06-14
- 适用 Strapi 版本:5.48.0
- 数据库:SQLite(开发);生产建议 PostgreSQL
- 中文翻译条数:本项目自带 ~960 条覆盖,见 `cms/src/admin/translations/zh-Hans.json`
- 维护人:运营 + 开发协作

### 项目结构速览

```
shuanghong-web/
├── cms/                ← Strapi 5 后端
│   ├── src/
│   │   ├── admin/
│   │   │   ├── app.tsx              ← 后台扩展(中文注入 + 隐藏菜单)
│   │   │   └── translations/        ← 本地中文翻译覆盖
│   │   ├── api/                     ← 各内容类型 controller/service/schema
│   │   ├── components/              ← 复用的字段块(seo.meta, contact.info)
│   │   └── index.ts                 ← register/bootstrap/start
│   ├── config/                      ← 数据库、插件、中间件配置
│   ├── database/                    ← 迁移
│   └── scripts/                     ← 种子脚本等
├── web/                ← Next.js 16 前端
├── deploy/             ← 部署配置(PM2 + Nginx + setup 脚本)
└── docs/               ← 项目文档(OPERATIONS_MANUAL.md + DEVELOPER_GUIDE.md)
```

### Strapi 升级流程

```bash
cd cms
npx @strapi/upgrade latest --dry    # 1) 看升级预告
npx @strapi/upgrade latest          # 2) 实际升级(改 package.json + 跑 codemod)
yarn install                        # 3) 装新依赖
yarn build                          # 4) 构建
yarn develop                        # 5) 启动,检查 admin 行为
yarn test:unit                      # 6) 跑测试
```

### 字段变更同步

> 📌 **当 Strapi 升级、或内容类型有新增/删除字段时,请同步更新本文档的「内容类型字段速查表」一节**。
> 改动较大时,把变更要点同步到团队群,避免运营按旧文档操作出错。

### 框架源码参考

项目本地还克隆了 Strapi 5 框架源码到 `/mnt/e/github/strapi-develop/`(只读参考),用于:
- 升级时对比本地代码和上游 breaking change
- 调试某个诡异 bug 时临时改框架源码看是不是框架问题
- 翻源码确认某个组件 props / aria-label 写法

**该目录不应主动改代码**;改框架源码属上游 PR 范畴,本地 fork 仅为只读参考。

---

**祝开发顺利!改动前先看 `cms/src/index.ts` 的 bootstrap,理解 Public 权限和数据种子逻辑。**
