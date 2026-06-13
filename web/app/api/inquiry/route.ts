import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;

interface InquiryPayload {
  name: string;
  company: string;
  email: string;
  phone?: string;
  interest: 'multimodal' | 'ai' | 'other';
  message: string;
  turnstileToken?: string;
}

async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // dev mode
  const params = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token });
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
  if (!['multimodal', 'ai', 'other'].includes(body.interest)) errors.push('interest must be multimodal/ai/other');
  if (errors.length > 0) {
    return NextResponse.json({ error: { message: errors.join('; ') } }, { status: 400 });
  }

  // Verify Turnstile (skipped if secret not set)
  if (TURNSTILE_SECRET && body.turnstileToken) {
    const ok = await verifyTurnstile(body.turnstileToken, req.headers.get('x-forwarded-for') ?? undefined);
    if (!ok) {
      return NextResponse.json({ error: { message: 'Turnstile verification failed' } }, { status: 400 });
    }
  }

  // Forward to Strapi
  const strapiRes = await fetch(`${STRAPI_URL}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        interest: body.interest,
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
