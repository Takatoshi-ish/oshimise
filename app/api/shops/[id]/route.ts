import { NextResponse, type NextRequest } from 'next/server';
import { findShopById } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';
import { listPhotosByShop } from '@/lib/repositories/photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
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
  const [recommendations, photos] = await Promise.all([
    listRecommendationsByShop(shop.id),
    listPhotosByShop(shop.id),
  ]);
  return NextResponse.json({ shop, recommendations, photos });
}
