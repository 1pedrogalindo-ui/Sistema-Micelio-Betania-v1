import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'Micelio Betania Cron Daily',
    message: 'Cron endpoint activo',
    timestamp: new Date().toISOString(),
  });
}
