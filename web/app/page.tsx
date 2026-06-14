import { getHomePage } from '@/lib/data';
import { getAllSolutions } from '@/lib/data';
import Link from 'next/link';

export const revalidate = 60;

export default async function HomePage() {
  const [home, solutions] = await Promise.all([
    getHomePage(),
    getAllSolutions(),
  ]);

  const multimodalCount = solutions.filter((s) => s.category === 'multimodal').length;
  const aiCount = solutions.filter((s) => s.category === 'ai_application').length;

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-wave blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-wave blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              {home?.heroTitleLine1 ?? '汽车与机器人领域的多模态交互专家'}
              <br />
              <span className="text-brand-wave">
                {home?.heroTitleLine2 ?? '制造及建筑业的智能AI应用普及者'}
              </span>
            </h1>
            {home?.heroSubtitle ? (
              <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl">
                {home.heroSubtitle}
              </p>
            ) : null}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href={home?.ctaPrimaryLink ?? '/multimodal'}
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand-dark hover:bg-brand-tint transition"
              >
                {home?.ctaPrimaryLabel ?? '多模态交互方案'} →
              </Link>
              <Link
                href={home?.ctaSecondaryLink ?? '/ai-application'}
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition"
              >
                {home?.ctaSecondaryLabel ?? '智能AI应用解决方案'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-brand">{multimodalCount}</div>
            <div className="mt-2 text-sm text-muted-foreground">多模态方案</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-category-ai">{aiCount}</div>
            <div className="mt-2 text-sm text-muted-foreground">AI 应用方案</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-brand">{solutions.length}+</div>
            <div className="mt-2 text-sm text-muted-foreground">累计解决方案</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-brand">100%</div>
            <div className="mt-2 text-sm text-muted-foreground">自主可控</div>
          </div>
        </div>
      </section>

      {/* Solution Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">解决方案</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            覆盖多模态交互与 AI 智能体应用,助力行业智能化升级
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.slice(0, 9).map((s) => (
            <Link
              key={s.id}
              href={`/cases/${s.slug}`}
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand transition"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.category === 'multimodal'
                      ? 'bg-category-multimodal/10 text-category-multimodal'
                      : 'bg-category-ai/10 text-category-ai'
                  }`}
                >
                  {s.category === 'multimodal' ? '多模态' : 'AI 应用'}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-brand transition">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {s.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-tint">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">开启智能化升级之旅</h2>
          <p className="mt-4 text-base text-muted-foreground">
            我们的专家团队随时为您提供咨询与方案设计
          </p>
          <div className="mt-8">
            <Link
              href="/about#contact"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-8 py-3 text-base font-semibold text-white hover:bg-brand-dark transition"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
