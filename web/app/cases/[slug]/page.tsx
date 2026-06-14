import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSolutionBySlug, getAllSolutionSlugs } from '@/lib/data';
import { CaseArticle } from '@/components/CaseArticle';

export const revalidate = 60;

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllSolutionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) {
    return { title: '案例未找到' };
  }
  const seo = solution.seo;
  return {
    title: seo?.title ?? solution.title,
    description: seo?.description ?? solution.description?.slice(0, 160),
    keywords: seo?.keywords,
    openGraph: seo?.ogImage
      ? { images: [{ url: seo.ogImage.url }] }
      : undefined,
  };
}

export default async function CaseDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) {
    notFound();
  }
  return (
    <main className="flex-1">
      <CaseArticle solution={solution} />
    </main>
  );
}
