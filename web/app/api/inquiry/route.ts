import { NextRequest, NextResponse } from 'next/server';

interface InquiryPayload {
  name: string;
  company: string;
  email: string;
  phone?: string;
  interest: 'multimodal' | 'ai' | 'other';
  message: string;
  turnstileToken?: string;
}

function getStrapiUrl(): string {
  return process.env.STRAPI_URL || 'http://127.0.0.1:1337';
}

async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true; // dev mode
  const params = new URLSearchParams({ secret, response: token });
  if (remoteip) params.append('remoteip', remoteip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  let body: InquiryPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON' } }, { status: 400 });
  }

  // Validate
  const errors: string[] = [];
  if (!body.name?.trim()) errors.push('name required');
  if (!body.company?.trim()) errors.push('company required');
  if (!body.email?.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(body.email)) errors.push('valid email required');
  if (!body.message?.trim() || body.message.length > 1000) errors.push('message required (max 1000 chars)');
  if (body.interest && !['multimodal', 'ai', 'other'].includes(body.interest)) errors.push('interest must be multimodal/ai/other');
  if (errors.length > 0) {
    return NextResponse.json({ error: { message: errors.join('; ') } }, { status: 400 });
  }

  // Verify Turnstile (skipped if secret not set)
  if (process.env.TURNSTILE_SECRET && body.turnstileToken) {
    const ok = await verifyTurnstile(body.turnstileToken, req.headers.get('x-forwarded-for') ?? undefined);
    if (!ok) {
      return NextResponse.json({ error: { message: 'Turnstile verification failed' } }, { status: 400 });
    }
  }

  // Forward to Strapi
  const strapiRes = await fetch(`${getStrapiUrl()}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        interest: body.interest ?? 'other',
        message: body.message,
        sourcePage: req.headers.get('referer') ?? '',
      },
    }),
  });

  if (!strapiRes.ok) {
    const errBody = await strapiRes.text();
    return NextResponse.json(
      { error: { message: `Strapi ${strapiRes.status}: ${errBody}` } },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
