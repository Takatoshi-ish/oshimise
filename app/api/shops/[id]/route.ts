import { NextResponse, type NextRequest } from 'next/server';
import { findShopById, isShopVisibleToTeams } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';
import { listPhotosByShop } from '@/lib/repositories/photos';
import { listVisibleTeamIds } from '@/lib/repositories/teams';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'id required' } },
      { status: 400 },
    );
  }
  const shop = await findShopById(id);
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
  const [recommendations, photos] = await Promise.all([
    listRecommendationsByShop(shop.id),
    listPhotosByShop(shop.id),
  ]);
  return NextResponse.json({ shop, recommendations, photos });
}
