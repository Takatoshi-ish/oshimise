import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { listFeed } from '@/lib/repositories/recommendations';
import { listVisibleTeamIds } from '@/lib/repositories/teams';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  pref: z.string().trim().min(1).max(30).optional().nullable(),
  genre: z.string().trim().min(1).max(30).optional().nullable(),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  viewerTeamId: z.string().uuid().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = QuerySchema.safeParse({
    pref: sp.get('pref') || null,
    genre: sp.get('genre') || null,
    offset: sp.get('offset') || 0,
    viewerTeamId: sp.get('viewerTeamId') || null,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  try {
    const visibleTeamIds = parsed.data.viewerTeamId
      ? await listVisibleTeamIds(parsed.data.viewerTeamId)
      : null;
    const items = await listFeed({ ...parsed.data, visibleTeamIds });
    return NextResponse.json(items);
  } catch (e) {
    console.error('/api/feed error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}
