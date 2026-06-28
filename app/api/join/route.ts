import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import { insertMember } from '@/lib/repositories/members';
import { findTeamById } from '@/lib/repositories/teams';
import { appendMember, fireAndForget } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  name: z.string().trim().min(1).max(30),
  teamId: z.string().uuid(),
  passcode: z.string().max(200).optional(),
});

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
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }

  // Optional join passcode check
  const expected = process.env.JOIN_PASSCODE;
  if (expected) {
    if (!parsed.data.passcode || !safeEqual(parsed.data.passcode, expected)) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'wrong passcode' } },
        { status: 401 },
      );
    }
  }

  const team = await findTeamById(parsed.data.teamId);
  if (!team || !team.active) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid team' } },
      { status: 400 },
    );
  }

  const member = await insertMember(parsed.data.name, parsed.data.teamId);
  fireAndForget(
    'join POST',
    appendMember({
      name: member.name,
      active: member.active,
      teamName: team.name,
      createdAt: member.createdAt,
    }),
  );
  return NextResponse.json(
    {
      id: member.id,
      name: member.name,
      teamId: team.id,
      teamName: team.name,
    },
    { status: 201 },
  );
}
