import { notFound } from 'next/navigation';
import { findShopById, isShopVisibleToTeams } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';
import { listPhotosByShop } from '@/lib/repositories/photos';
import { listVisibleTeamIds } from '@/lib/repositories/teams';
import { ShopDetail } from '@/components/shop/ShopDetail';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ viewerTeamId?: string }>;
}) {
  const { id } = await params;
  const { viewerTeamId } = await searchParams;
  const shop = await findShopById(id);
  if (!shop) notFound();
  if (viewerTeamId) {
    const visible = await listVisibleTeamIds(viewerTeamId);
    const ok = await isShopVisibleToTeams(shop.id, visible);
    if (!ok) notFound();
  }
  const [recommendations, photos] = await Promise.all([
    listRecommendationsByShop(shop.id),
    listPhotosByShop(shop.id),
  ]);
  return (
    <ShopDetail
      shop={shop}
      recommendations={recommendations}
      photos={photos}
    />
  );
}
