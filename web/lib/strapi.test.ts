import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { strapiFetch, StrapiError } from './strapi';

describe('strapiFetch', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'http://test-strapi:1337');
    vi.stubEnv('STRAPI_API_TOKEN', '');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('builds URL with STRAPI_URL base', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    globalThis.fetch = mockFetch;

    await strapiFetch('/api/home-page');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/^http:\/\/test-strapi:1337\/api\/home-page/);
  });

  it('appends populate query param when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    globalThis.fetch = mockFetch;

    await strapiFetch('/api/solutions', { populate: '*' });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('populate=*');
  });

  it('appends custom params', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    globalThis.fetch = mockFetch;

    await strapiFetch('/api/solutions', {
      params: { 'pagination[pageSize]': 10, 'sort': 'order:asc' },
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('pagination%5BpageSize%5D=10');
    expect(url).toContain('sort=order%3Aasc');
  });

  it('includes Authorization header when STRAPI_API_TOKEN is set', async () => {
    vi.stubEnv('STRAPI_API_TOKEN', 'test-token-abc');
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    globalThis.fetch = mockFetch;

    await strapiFetch('/api/home-page');

    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer test-token-abc');
  });

  it('throws StrapiError on non-2xx response', async () => {
    globalThis.fetch = vi.fn().mockImplementation(
      () => Promise.resolve(new Response('not found', { status: 404, statusText: 'Not Found' })),
    );

    await expect(strapiFetch('/api/missing')).rejects.toBeInstanceOf(StrapiError);
    await expect(strapiFetch('/api/missing')).rejects.toMatchObject({ status: 404 });
  });

  it('returns parsed JSON on 2xx', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1, title: 'Hello' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await strapiFetch<{ data: { title: string } }>('/api/x');
    expect(result.data.title).toBe('Hello');
  });

  it('omits undefined param values', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    globalThis.fetch = mockFetch;

    await strapiFetch('/api/x', {
      params: { a: 'keep', b: undefined, c: 0 },
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('a=keep');
    expect(url).not.toContain('b=');
    expect(url).toContain('c=0');
  });
});
