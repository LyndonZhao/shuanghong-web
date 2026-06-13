import { getMultimodalPage, getAllSolutions } from '@/lib/data';
import { SolutionGrid } from '@/components/SolutionGrid';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '多模态交互解决方案',
  description: '端云协同的多模态交互解决方案,覆盖导览、文旅、企业服务、汽车座舱等场景。',
};

export default async function MultimodalPage() {
  const [page, allSolutions] = await Promise.all([
    getMultimodalPage(),
    getAllSolutions(),
  ]);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-category-multimodal to-category-multimodal/80 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur">
              多模态交互
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {page?.coreAdvantageTitle ?? '核心优势:端云协同的多模态交互'}
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">多模态交互方案</h2>
          <p className="mt-2 text-muted-foreground">
            结合语音、视觉、触觉等多种模态,实现人与机器的自然交互
          </p>
        </div>
        <SolutionGrid
          solutions={allSolutions}
          category="multimodal"
          showCategory={false}
        />
      </section>
    </main>
  );
}
