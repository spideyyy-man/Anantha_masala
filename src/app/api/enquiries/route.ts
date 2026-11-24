import { NextRequest, NextResponse } from 'next/server';
import { createEnquiry } from '@/domain/enquiries/service';
import { enquirySchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`enquiry:${client}`, 8, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many enquiry submissions. Please wait a minute before trying again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        'Please review the highlighted fields and try again.',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { websiteUrl: _honeypot, ...cleanData } = parsed.data;
    void _honeypot;
    const saved = await createEnquiry(cleanData);

    return NextResponse.json(
      {
        ok: true,
        referenceCode: saved.referenceCode,
        type: saved.type,
        createdAt: saved.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    logServerError('POST /api/enquiries', err);
    return jsonError('Could not record your enquiry right now.', 500);
  }
}
