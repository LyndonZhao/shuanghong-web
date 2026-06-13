import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

function makeReq(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/inquiry', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'http://test-cms:1337');
    vi.stubEnv('TURNSTILE_SECRET', '');
    vi.clearAllMocks();
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost/api/inquiry', {
      method: 'POST',
      body: 'not json',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const req = makeReq({ name: '', company: '', email: '', message: '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toMatch(/name required/);
  });

  it('returns 400 on invalid email', async () => {
    const req = makeReq({
      name: 'A', company: 'B', email: 'not-an-email', message: 'm',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toMatch(/valid email/);
  });

  it('returns 400 on invalid interest enum', async () => {
    const req = makeReq({
      name: 'A', company: 'B', email: 'a@b.c', interest: 'hacking', message: 'm',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects message over 1000 chars', async () => {
    const req = makeReq({
      name: 'A', company: 'B', email: 'a@b.c', message: 'x'.repeat(1001),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('forwards valid payload to Strapi and returns 200', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 5 } }), { status: 200 }),
    );

    const req = makeReq({
      name: 'A', company: 'B', email: 'a@b.c', interest: 'ai', message: 'm',
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://test-cms:1337/api/inquiries',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.data.name).toBe('A');
    expect(body.data.interest).toBe('ai');
  });

  it('returns 502 when Strapi is down', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('strapi boom', { status: 500 }),
    );
    const req = makeReq({
      name: 'A', company: 'B', email: 'a@b.c', message: 'm',
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
  });
});
