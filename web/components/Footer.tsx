import { getSiteSetting } from '@/lib/data';

const FALLBACK_FOOTER = '© 2026 上海双泓信息科技有限公司 · 保留所有权利';

export async function Footer() {
  const site = await getSiteSetting();
  const text = site?.footerText ?? FALLBACK_FOOTER;
  const icp = site?.icpNumber;

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-muted-foreground">
        <p>{text}</p>
        {icp ? (
          <p className="mt-2">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand transition"
            >
              {icp}
            </a>
          </p>
        ) : null}
      </div>
    </footer>
  );
}
