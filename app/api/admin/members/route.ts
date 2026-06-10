import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import { listAllMembers, insertMember } from '@/lib/repositories/members';
import { appendMember, fireAndForget } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PostBody = z.object({ name: z.string().trim().min(1).max(30) });

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const members = await listAllMembers();
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid json' } },
      { status: 400 },
    );
  }
  const parsed = PostBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  const member = await insertMember(parsed.data.name);
  fireAndForget(
    'admin member POST',
    appendMember({
      name: member.name,
      active: member.active,
      createdAt: member.createdAt,
    }),
  );
  return NextResponse.json(member, { status: 201 });
}
