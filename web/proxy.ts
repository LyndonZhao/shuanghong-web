import { NextRequest, NextResponse } from 'next/server';

/**
 * 中间件：把旧版 next-intl 的 /zh/ 前缀去除。
 *
 * 背景：原生产站点（118.145.99.239:3002）使用 next-intl，所有路由都带
 * `/zh/...` 前缀（如 `/zh/cases/manufacturing`）。新版本不再用 next-intl，
 * 但要保证旧 URL 仍能跳到新页面（避免 SEO 链接断裂）。
 *
 * 行为：访问 `/zh/...` → 307 重定向到去掉 `/zh` 前缀的 URL。
 */
export function proxy(request: NextRequest) {
  const { pathname, search, hash } = request.nextUrl;

  // 只处理 /zh/ 前缀（不区分大小写）
  const match = /^\/zh(\/|$)/i.exec(pathname);
  if (!match) {
    return NextResponse.next();
  }

  const stripped = pathname.replace(/^\/zh/i, '') || '/';
  const redirectUrl = new URL(stripped + search + hash, request.url);
  return NextResponse.redirect(redirectUrl, 307);
}

export const config = {
  // 排除静态资源与 Next.js 内部路由
  matcher: [
    '/((?!_next/|api/|.*\\..*).*)',
  ],
};
