/**
 * Server-side data fetching helpers.
 * Thin wrappers around strapiFetch that return typed data.
 */

import { strapiFetch } from './strapi';
import type {
  HomePage,
  MultimodalPage,
  AIApplicationPage,
  AboutPage,
  Solution,
  SiteSetting,
  StrapiListResponse,
  StrapiSingleResponse,
} from './types';

const REVALIDATE = 60; // 60s ISR

export async function getHomePage(): Promise<HomePage | null> {
  const res = await strapiFetch<StrapiSingleResponse<HomePage>>('/api/home-page', {
    revalidate: REVALIDATE,
    tags: ['home-page'],
  });
  return res.data;
}

export async function getMultimodalPage(): Promise<MultimodalPage | null> {
  const res = await strapiFetch<StrapiSingleResponse<MultimodalPage>>(
    '/api/multimodal-page',
    { revalidate: REVALIDATE, tags: ['multimodal-page'], populate: 'solutions' },
  );
  return res.data;
}

export async function getAIApplicationPage(): Promise<AIApplicationPage | null> {
  const res = await strapiFetch<StrapiSingleResponse<AIApplicationPage>>(
    '/api/ai-application-page',
    { revalidate: REVALIDATE, tags: ['ai-application-page'], populate: 'solutions' },
  );
  return res.data;
}

export async function getAboutPage(): Promise<AboutPage | null> {
  const res = await strapiFetch<StrapiSingleResponse<AboutPage>>('/api/about-page', {
    revalidate: REVALIDATE,
    tags: ['about-page'],
  });
  return res.data;
}

export async function getAllSolutions(): Promise<Solution[]> {
  const res = await strapiFetch<StrapiListResponse<Solution>>('/api/solutions', {
    revalidate: REVALIDATE,
    tags: ['solutions'],
    params: { 'pagination[pageSize]': 100, 'sort': 'order:asc' },
  });
  return res.data;
}

export async function getSolutionsByCategory(
  category: 'multimodal' | 'ai_application',
): Promise<Solution[]> {
  const res = await strapiFetch<StrapiListResponse<Solution>>('/api/solutions', {
    revalidate: REVALIDATE,
    tags: ['solutions', `solutions-${category}`],
    params: {
      'filters[category][$eq]': category,
      'pagination[pageSize]': 100,
      'sort': 'order:asc',
    },
  });
  return res.data;
}

/**
 * 按 slug 查单条 solution，附带 sections / seo / coverImage。
 * 用于 /cases/[slug] 详情页。
 *
 * 多个 `populate` 字段通过 strapiFetch 展开成多个 query 参数，
 * 避免 Strapi 5 的嵌套方括号语法在某些版本被拒。
 */
export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const res = await strapiFetch<StrapiListResponse<Solution>>('/api/solutions', {
    revalidate: REVALIDATE,
    tags: ['solutions', `solution-${slug}`],
    populate: ['sections', 'coverImage', 'seo'],
    params: {
      'filters[slug][$eq]': slug,
      'pagination[pageSize]': 1,
    },
  });
  return res.data[0] ?? null;
}

/**
 * 拉所有 solution 的 slug 列表，用于 generateStaticParams。
 */
export async function getAllSolutionSlugs(): Promise<string[]> {
  const res = await strapiFetch<StrapiListResponse<Pick<Solution, 'slug'>>>(
    '/api/solutions',
    {
      revalidate: REVALIDATE,
      tags: ['solutions'],
      params: { 'fields[0]': 'slug', 'pagination[pageSize]': 100 },
    },
  );
  return res.data.map((s) => s.slug).filter((s): s is string => Boolean(s));
}

export async function getSiteSetting(): Promise<SiteSetting | null> {
  const res = await strapiFetch<StrapiListResponse<SiteSetting>>('/api/site-settings', {
    revalidate: REVALIDATE,
    tags: ['site-setting'],
  });
  return res.data[0] ?? null;
}

export async function getStrapiImageUrl(path: string | undefined | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
  return `${base}${path}`;
}
