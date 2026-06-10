import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import { setAdminCookie, clearAdminCookie } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ passcode: z.string().min(1).max(200) });

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid json' } },
      { status: 400 },
    );
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'passcode required' } },
      { status: 400 },
    );
  }
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || !safeEqual(parsed.data.passcode, expected)) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'wrong passcode' } },
      { status: 401 },
    );
  }
  await setAdminCookie(parsed.data.passcode);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
