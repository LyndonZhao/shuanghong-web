import Link from 'next/link';
import type { ReactElement } from 'react';
import type { Solution } from '@/lib/types';
import { Markdown } from './Markdown';

interface CaseArticleProps {
  solution: Solution;
}

const CATEGORY_LABEL: Record<string, { label: string; backHref: string }> = {
  multimodal: { label: '多模态交互', backHref: '/multimodal' },
  ai_application: { label: '智能 AI 应用', backHref: '/ai-application' },
};

export function CaseArticle({ solution }: CaseArticleProps): ReactElement {
  const cat = CATEGORY_LABEL[solution.category] ?? {
    label: solution.category,
    backHref: '/',
  };
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'tangsy@sunhorizontech.com';

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      {/* 返回箭头 */}
      <Link
        href={cat.backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand transition mb-10"
      >
        <span aria-hidden>←</span>
        <span>返回{cat.label}</span>
      </Link>

      {/* Header: eyebrow + 编号 h1 */}
      <header className="mb-12 border-b border-gray-200 pb-10">
        <div className="text-xs font-medium uppercase tracking-widest text-brand">
          已交付用例 · #{solution.order}
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {solution.title}
        </h1>
        {solution.description ? (
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {solution.description}
          </p>
        ) : null}
      </header>

      {/* Sections */}
      <div className="case-sections">
        {(solution.sections ?? []).map((s, i) => (
          <section
            key={s.id ?? i}
            id={`section-${i}`}
            className="mb-12 scroll-mt-20"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-5">
              {s.heading}
            </h2>
            <Markdown source={s.body} />
          </section>
        ))}
      </div>

      {/* 收尾 mailto CTA */}
      <footer className="mt-16 border-t border-gray-200 pt-10 text-center">
        <p className="text-sm text-muted-foreground">
          想了解这个方案如何适配你的场景？
        </p>
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent(
            '案例咨询：' + solution.title,
          )}`}
          className="mt-4 inline-flex items-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition"
        >
          聊聊这个方案 →
        </a>
      </footer>
    </article>
  );
}
