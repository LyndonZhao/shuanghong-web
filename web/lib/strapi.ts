/**
 * Strapi API client.
 * Server-side fetch wrapper with URL building + JSON parsing.
 *
 * Usage:
 *   const data = await strapiFetch<StrapiResponse<HomePage>>('/api/home-page', {
 *     next: { revalidate: 60 },
 *     populate: '*',
 *   });
 */

export interface FetchOptions {
  /** Next.js ISR revalidation interval in seconds. */
  revalidate?: number | false;
  /** Cache tag for revalidateTag() (Next 15+). */
  tags?: string[];
  /**
   * Strapi `populate` 字段。Strapi 5 不接受逗号分隔，所以传数组会展开为
   * 多个 `?populate=xxx` 查询参数（如 `populate: ['sections', 'seo']`）。
   * 单个字符串 `'*'` 或 `'solutions'` 也仍然有效。
   */
  populate?: string | string[];
  /** Other query params to append. */
  params?: Record<string, string | number | boolean | undefined>;
}

export class StrapiError extends Error {
  constructor(public status: number, public url: string, public body: unknown) {
    super(`Strapi ${status} on ${url}`);
    this.name = 'StrapiError';
  }
}

function getStrapiUrl(): string {
  return process.env.STRAPI_URL || 'http://127.0.0.1:1337';
}

function getStrapiToken(): string | undefined {
  return process.env.STRAPI_API_TOKEN || undefined;
}

export async function strapiFetch<T = unknown>(
  path: string,
  { revalidate = 60, tags, populate, params }: FetchOptions = {},
): Promise<T> {
  const url = new URL(path, getStrapiUrl());

  if (populate) {
    const populateList = Array.isArray(populate) ? populate : [populate];
    for (const p of populateList) {
      url.searchParams.append('populate', p);
    }
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.append(k, String(v));
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getStrapiToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate, tags },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new StrapiError(res.status, url.pathname + url.search, body);
  }

  return res.json() as Promise<T>;
}
