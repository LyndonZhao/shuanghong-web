import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录',
  description: '账号登录(占位)',
};

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-brand-tint">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-2xl">
          🔒
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          当前为占位页面。后续将集成企业 SSO 登录。
        </p>
        <form className="mt-6 space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              disabled
              placeholder="you@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              disabled
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            登录(即将开放)
          </button>
        </form>
        <div className="mt-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-brand transition">
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
