import { NextResponse, type NextRequest } from 'next/server';
import { findShopByPlaceId } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
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
  const recommendations = await listRecommendationsByShop(shop.id);
  return NextResponse.json({ shop, recommendations });
}
