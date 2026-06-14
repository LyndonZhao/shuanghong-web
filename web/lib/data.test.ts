import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSolutionBySlug,
  getAllSolutionSlugs,
  getHomePage,
  getMultimodalPage,
  getAIApplicationPage,
  getAboutPage,
  getAllSolutions,
  getSolutionsByCategory,
  getSiteSetting,
  getStrapiImageUrl,
} from './data';
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

describe('single-type fetchers', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('getHomePage unwraps the data envelope', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { id: 1, documentId: 'h1', heroTitle: '首页' },
          meta: {},
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const home = await getHomePage();
    expect(home?.heroTitle).toBe('首页');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/api/home-page');
  });

  it('getMultimodalPage passes populate=solutions', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { id: 1, documentId: 'm1' }, meta: {} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await getMultimodalPage();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('populate=solutions');
  });

  it('getAIApplicationPage passes populate=solutions', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { id: 1, documentId: 'a1' }, meta: {} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await getAIApplicationPage();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('populate=solutions');
  });

  it('getAboutPage hits /api/about-page', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { id: 1, documentId: 'ab1' }, meta: {} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await getAboutPage();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/api/about-page');
  });

  it('returns null when Strapi returns no data envelope', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: null, meta: {} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    expect(await getHomePage()).toBeNull();
  });
});

describe('getAllSolutions', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('passes pageSize=100 and sort=order:asc', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { id: 1, slug: 'a', title: 'A' },
            { id: 2, slug: 'b', title: 'B' },
          ],
          meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: 2 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const list = await getAllSolutions();
    expect(list).toHaveLength(2);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('pagination%5BpageSize%5D=100');
    expect(url).toContain('sort=order%3Aasc');
  });
});

describe('getSolutionsByCategory', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('filters by category and uses the category-scoped cache tag', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: [], meta: { pagination: { page: 1, pageSize: 100, pageCount: 0, total: 0 } } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await getSolutionsByCategory('multimodal');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('filters%5Bcategory%5D%5B%24eq%5D=multimodal');
    expect(url).toContain('pagination%5BpageSize%5D=100');
    expect(url).toContain('sort=order%3Aasc');
  });
});

describe('getSiteSetting', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns the first item from the collection', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 1,
              documentId: 's1',
              logoSubtitle: '副标题',
              footerText: '页脚',
              navMenu: [{ label: '首页', href: '/' }],
              analyticsBaidu: null,
              analyticsGa: null,
              icpNumber: null,
            },
          ],
          meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const site = await getSiteSetting();
    expect(site?.logoSubtitle).toBe('副标题');
    expect(site?.navMenu?.[0].href).toBe('/');
  });

  it('returns null when no site-setting exists', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    expect(await getSiteSetting()).toBeNull();
  });
});

describe('getStrapiImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null for empty input', async () => {
    expect(await getStrapiImageUrl(undefined)).toBeNull();
    expect(await getStrapiImageUrl(null)).toBeNull();
    expect(await getStrapiImageUrl('')).toBeNull();
  });

  it('returns absolute URLs untouched', async () => {
    expect(await getStrapiImageUrl('https://cdn.example.com/x.jpg')).toBe(
      'https://cdn.example.com/x.jpg',
    );
    expect(await getStrapiImageUrl('http://example.com/x.jpg')).toBe(
      'http://example.com/x.jpg',
    );
  });

  it('prepends STRAPI_URL to relative paths', async () => {
    vi.stubEnv('STRAPI_URL', 'http://cms.local:1337');
    expect(await getStrapiImageUrl('/uploads/x.jpg')).toBe(
      'http://cms.local:1337/uploads/x.jpg',
    );
  });

  it('falls back to the default Strapi URL when STRAPI_URL is unset', async () => {
    vi.stubEnv('STRAPI_URL', '');
    expect(await getStrapiImageUrl('/uploads/x.jpg')).toBe(
      'http://127.0.0.1:1337/uploads/x.jpg',
    );
  });
});

