import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSolutionBySlug, getAllSolutionSlugs } from './data';
import { StrapiError } from './strapi';

const mockFetch = vi.spyOn(globalThis, 'fetch');

describe('getSolutionBySlug', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('queries Strapi with the slug filter and populates sections/coverImage/seo', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 10,
              documentId: 'doc-1',
              title: '制造业 AI 落地服务',
              slug: 'manufacturing',
              category: 'ai_application',
              order: 10,
              sections: [{ id: 1, heading: '我们做什么', body: '...' }],
            },
          ],
          meta: { pagination: { page: 1, pageSize: 1, pageCount: 1, total: 1 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const solution = await getSolutionBySlug('manufacturing');

    expect(solution).not.toBeNull();
    expect(solution?.title).toBe('制造业 AI 落地服务');
    expect(solution?.sections).toHaveLength(1);
    expect(solution?.sections?.[0].heading).toBe('我们做什么');

    // 验证 URL 拼接：filters + populate 各作为独立 query 参数
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('filters%5Bslug%5D%5B%24eq%5D=manufacturing');
    // 多个 populate 字段应作为独立 query 参数传递
    const matches = calledUrl.match(/populate=[^&]+/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
    expect(matches.some((m) => m.includes('sections'))).toBe(true);
    expect(matches.some((m) => m.includes('coverImage'))).toBe(true);
    expect(matches.some((m) => m.includes('seo'))).toBe(true);
  });

  it('returns null when the slug does not exist', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          meta: { pagination: { page: 1, pageSize: 1, pageCount: 0, total: 0 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const solution = await getSolutionBySlug('not-exist');
    expect(solution).toBeNull();
  });

  it('throws StrapiError when Strapi returns an error', async () => {
    mockFetch.mockResolvedValue(
      new Response('{"error":"bad request"}', { status: 400 }),
    );

    await expect(getSolutionBySlug('bad-slug')).rejects.toBeInstanceOf(StrapiError);
  });
});

describe('getAllSolutionSlugs', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns a flat list of slug strings', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { slug: 'manufacturing' },
            { slug: 'first-patent' },
            { slug: '' }, // 空 slug 应被过滤
          ],
          meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: 3 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const slugs = await getAllSolutionSlugs();
    expect(slugs).toEqual(['manufacturing', 'first-patent']);
  });
});
