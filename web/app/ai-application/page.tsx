import { getAIApplicationPage, getAllSolutions } from '@/lib/data';
import { SolutionGrid } from '@/components/SolutionGrid';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '智能AI应用解决方案',
  description: 'AI 智能体集成平台,覆盖专利撰写、报价、图纸审核、数字营销、AUTOSAR 研发等场景。',
};

export default async function AIApplicationPage() {
  const [page, allSolutions] = await Promise.all([
    getAIApplicationPage(),
    getAllSolutions(),
  ]);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-category-ai to-category-ai/80 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur">
              智能 AI 应用
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {page?.coreAdvantageTitle ?? '核心优势:AI智能体集成平台'}
            </h1>
            {page?.coreAdvantageDesc ? (
              <p className="mt-6 text-lg text-white/90 max-w-2xl whitespace-pre-line">
                {page.coreAdvantageDesc}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Solution Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">智能 AI 应用方案</h2>
          <p className="mt-2 text-muted-foreground">
            面向行业垂直场景的 AI 智能体集成平台,快速部署、可视化编排、效果可观测
          </p>
        </div>
        <SolutionGrid
          solutions={allSolutions}
          category="ai_application"
          showCategory={false}
        />
      </section>
    </main>
  );
}
