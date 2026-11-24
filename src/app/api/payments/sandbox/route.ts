import { NextRequest, NextResponse } from 'next/server';
import { triggerSandboxPaymentSimulation } from '@/domain/orders/service';
import { sandboxPaymentActionSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`sandbox-pay:${client}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached for sandbox payment testing.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = sandboxPaymentActionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid sandbox payment action.', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await triggerSandboxPaymentSimulation(
      parsed.data.orderNumber,
      parsed.data.outcome,
      parsed.data.eventId
    );
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sandbox payment failed.';
    if (msg.includes('disabled') || msg.includes('not found')) {
      return jsonError(msg, msg.includes('disabled') ? 403 : 404);
    }
    logServerError('POST /api/payments/sandbox', err);
    return jsonError('Could not process sandbox payment simulation.', 500);
  }
}
