import type { StrapiApp } from '@strapi/strapi/admin';

import zhHansOverrides from './translations/zh-Hans.json';

/**
 * Strapi 5 admin panel extension.
 *
 * Three things are needed to make Simplified Chinese the default and
 * complete UI language for every admin user in this project:
 *
 * 1. `config.locales` declares which languages show up in the Profile
 *    language picker and which translation bundles `IntlProvider`
 *    loads. Without `zh-Hans` here the built-in Chinese files in
 *    `node_modules/@strapi/admin/.../translations/zh-Hans.json` would
 *    never be loaded.
 *
 * 2. `config.translations` ships a project-local override bundle that
 *    fills in the ~960 strings missing from Strapi's built-in
 *    `zh-Hans` files (homepage, content-manager edit-view actions,
 *    media library, releases, review-workflows, plugin-cloud, etc.).
 *    Strapi merges these on top of its built-ins, so anything we list
 *    here wins, anything we don't list falls back to the official
 *    translation, and last-resort fallback is English.
 *
 * 3. `bootstrap` seeds `localStorage['strapi-admin-language']` with
 *    `zh-Hans` on first visit. `StrapiApp.render()` reads the locale
 *    from that key and defaults to `'en'` if it's unset — it never
 *    consults the `admin_users.prefered_language` column directly.
 *    The seed runs once per browser; users who explicitly switch to
 *    another locale in their Profile keep their choice.
 */
const LANGUAGE_LOCAL_STORAGE_KEY = 'strapi-admin-language';
const DEFAULT_LOCALE = 'zh-Hans';

/**
 * 左侧导航中要永久隐藏的菜单 —— 每条规则是 { selector, wrapLi } 对.
 *
 *   selector  匹配要隐藏元素本身的 CSS 选择器
 *   wrapLi    true → 额外加一条 `li:has(${selector})` 规则,把外层 <li> 一起隐
 *             false → 只隐元素本身,**避免** :has() 误伤嵌套 <li> 父分组
 *
 * Strapi 5 导航结构有两种,匹配方式不同:
 *
 *   - 一级图标 nav(MainNav/MainNavLinks.mjs): 平铺 <ul>,每个图标在独立 <li>.
 *     代码硬编码了 `aria-label={labelValue}`,中文环境 labelValue 就是菜单文字
 *     (如 "市场" 对应 `global.marketplace` 翻译).可以 wrapLi: true 让 <li>
 *     一起塌陷,避免留空白.
 *
 *   - content-manager 子菜单(content-manager/components/LeftMenu.mjs):
 *     **嵌套** SubNav.Sections — 外层 <li> 包 Section(如"集合类型"),
 *     内层 <li> 包 SubNav.Link.如果用 `li:has(a[...])`,会同时匹配
 *     内层(期望命中)和外层(误伤父分组)的 <li>.所以这里 wrapLi: false,
 *     只隐 <a> 本身,外层 <li> 因子元素塌陷而无视觉影响.
 *
 * 仅做 UI 层隐藏 —— API、路由、插件完整保留,知道 URL 仍能直接访问.
 */
type HideRule = { selector: string; wrapLi?: boolean };

const HIDDEN_NAV_RULES: HideRule[] = [
  // 内容管理器 → 用户(本项目不开前端注册;表常年 0 条;
  //   注意必须 wrapLi: false,否则会把整个"集合类型"父分组隐掉)
  { selector: 'a[href*="plugin::users-permissions.user"]', wrapLi: false },

  // 一级菜单"市场"(运营不应安装插件;主 nav 平铺 <ul>,可安全 wrapLi)
  { selector: '[aria-label="市场"]', wrapLi: true },
  { selector: '[aria-label="Marketplace"]', wrapLi: true }, // 英文环境兜底

  // 一级菜单"部署"(@strapi/plugin-cloud 注入的 Strapi Cloud 部署入口;
  //   本项目自部署,不走 Strapi Cloud,运营也不应触发部署.
  //   中文 key 由 src/admin/translations/zh-Hans.json 的 "cloud.Plugin.name" 覆盖.
  //   注意:plugin-cloud 只在 backendURL 含 localhost 时才注入菜单,
  //   生产部署到正式域名时本就不出现,但本地开发环境仍需隐.)
  { selector: '[aria-label="部署"]', wrapLi: true },
  { selector: '[aria-label="Deploy"]', wrapLi: true }, // 英文环境兜底
];

const HIDE_NAV_STYLE_ID = 'cms-hide-nav-items';

function injectHideNavStyle() {
  if (typeof document === 'undefined') return;

  // 总是先移除旧 style 再注入新的:Vite HMR 修改 HIDDEN_NAV_RULES 后即时生效.
  document.getElementById(HIDE_NAV_STYLE_ID)?.remove();

  // 把每条规则展开成 CSS 选择器:
  //   - 元素本身(必加)
  //   - li:has(选择器)(可选,只对 wrapLi=true 加)
  // 浏览器兼容::has() 需 Chrome 105+/Firefox 121+/Safari 15.4+;Strapi 5 官方支持范围内.
  const rules = HIDDEN_NAV_RULES.flatMap(({ selector, wrapLi }) =>
    wrapLi ? [selector, `li:has(${selector})`] : [selector],
  ).join(',\n');

  const style = document.createElement('style');
  style.id = HIDE_NAV_STYLE_ID;
  style.textContent = `${rules} { display: none !important; }`;
  document.head.appendChild(style);
}

export default {
  config: {
    locales: ['zh-Hans', 'en'],
    translations: {
      'zh-Hans': zhHansOverrides as Record<string, string>,
    },
  },
  bootstrap(_app: StrapiApp) {
    if (typeof window === 'undefined') return;

    // 1) 永久隐藏指定的 content-manager 左侧菜单项.
    //    必须放在 language seed 的 reload 之前(reload 之后会重新进入 bootstrap,
    //    所以两次都会注入,但 styleId 去重保证只插一份).
    injectHideNavStyle();

    // 2) 首次访问的语言种子.
    const stored = window.localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY);
    if (stored) return;

    window.localStorage.setItem(LANGUAGE_LOCAL_STORAGE_KEY, DEFAULT_LOCALE);
    // `StrapiApp.render()` snapshotted the locale from localStorage
    // into the Redux store before this bootstrap ran, so we reload
    // once to apply the freshly-seeded value.
    window.location.reload();
  },
};
