import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Sandbox payment simulation is disabled while the store uses WhatsApp-first ordering. */
export async function POST() {
  return NextResponse.json(
    { error: 'Online payments are disabled. Please contact the store on WhatsApp.' },
    { status: 410 }
  );
}
