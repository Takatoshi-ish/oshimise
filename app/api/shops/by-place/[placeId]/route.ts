import { NextResponse, type NextRequest } from 'next/server';
import { findShopByPlaceId, isShopVisibleToTeams } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';
import { listVisibleTeamIds } from '@/lib/repositories/teams';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ placeId: string }> },
) {
  const { placeId } = await params;
  if (!placeId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'placeId required' } },
      { status: 400 },
    );
  }
  const shop = await findShopByPlaceId(placeId);
  if (!shop) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  const viewerTeamId = req.nextUrl.searchParams.get('viewerTeamId') || null;
  if (viewerTeamId) {
    const visible = await listVisibleTeamIds(viewerTeamId);
    const ok = await isShopVisibleToTeams(shop.id, visible);
    if (!ok) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'not found' } },
        { status: 404 },
      );
    }
  }
  const recommendations = await listRecommendationsByShop(shop.id);
  return NextResponse.json({ shop, recommendations });
}
