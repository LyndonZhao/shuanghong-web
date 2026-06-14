import Link from 'next/link';
import { getSiteSetting } from '@/lib/data';

const FALLBACK_NAV: { label: string; href: string }[] = [
  { label: '首页', href: '/' },
  { label: '多模态交互', href: '/multimodal' },
  { label: '智能AI应用', href: '/ai-application' },
  { label: '案例', href: '/cases/manufacturing' },
  { label: '关于双泓', href: '/about' },
];

export async function Header() {
  const site = await getSiteSetting();
  const nav = site?.navMenu && site.navMenu.length > 0 ? site.navMenu : FALLBACK_NAV;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="双泓科技" className="h-9 w-auto" />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-foreground">双泓科技</div>
            <div className="text-xs text-muted-foreground">
              {site?.logoSubtitle ?? '多模态交互专家 · 智能AI应用普及者'}
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground hover:text-brand transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/about#contact"
            className="hidden sm:inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
          >
            联系我们
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-brand transition"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
