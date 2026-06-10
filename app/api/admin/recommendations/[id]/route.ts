import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import {
  updateRecommendation,
  deleteRecommendation,
} from '@/lib/repositories/recommendations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Patch = z.object({
  comment: z.string().trim().min(1).max(200),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid json' } },
      { status: 400 },
    );
  }
  const parsed = Patch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  const ok = await updateRecommendation(id, parsed.data.comment);
  if (!ok) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const { id } = await params;
  const ok = await deleteRecommendation(id);
  if (!ok) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
