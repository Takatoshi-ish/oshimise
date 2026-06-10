import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import { updateMember } from '@/lib/repositories/members';
import { appendMember, fireAndForget } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Patch = z.object({
  name: z.string().trim().min(1).max(30).optional(),
  active: z.boolean().optional(),
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
  const updated = await updateMember(id, parsed.data);
  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  // Spec: append to "メンバー" tab on status change
  if (typeof parsed.data.active === 'boolean') {
    fireAndForget(
      'admin member PATCH',
      appendMember({
        name: updated.name,
        active: updated.active,
        createdAt: new Date().toISOString(),
      }),
    );
  }
  return NextResponse.json(updated);
}
