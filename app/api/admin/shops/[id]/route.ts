import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import { updateShop, deleteShop } from '@/lib/repositories/shops';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Patch = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  genre: z.string().trim().max(30).nullable().optional(),
  pref: z.string().trim().max(30).nullable().optional(),
  city: z.string().trim().max(30).nullable().optional(),
  area: z.string().trim().max(30).nullable().optional(),
  priceLevel: z.number().int().min(0).max(4).nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
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
  const updated = await updateShop(id, parsed.data);
  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  return NextResponse.json(updated);
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
  const ok = await deleteShop(id);
  if (!ok) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
