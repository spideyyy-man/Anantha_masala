import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Online order/payment checkout is intentionally paused while orders are handled on WhatsApp. */
export async function POST() {
  return NextResponse.json(
    { error: 'Online checkout is temporarily paused. Please place your order through WhatsApp.' },
    { status: 410 }
  );
}
