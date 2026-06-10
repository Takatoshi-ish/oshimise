import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { listFeed } from '@/lib/repositories/recommendations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  pref: z.string().trim().min(1).max(30).optional().nullable(),
  genre: z.string().trim().min(1).max(30).optional().nullable(),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = QuerySchema.safeParse({
    pref: sp.get('pref') || null,
    genre: sp.get('genre') || null,
    offset: sp.get('offset') || 0,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  try {
    const items = await listFeed(parsed.data);
    return NextResponse.json(items);
  } catch (e) {
    console.error('/api/feed error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}
