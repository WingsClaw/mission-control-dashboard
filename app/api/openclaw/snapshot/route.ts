import { NextResponse } from 'next/server';

import { getOpenClawSnapshot } from '@/lib/server/openclaw';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await getOpenClawSnapshot();
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      { message: 'Unable to read the local OpenClaw snapshot.' },
      { status: 500 },
    );
  }
}