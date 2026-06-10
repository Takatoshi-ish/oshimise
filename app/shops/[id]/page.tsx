import { notFound } from 'next/navigation';
import { findShopById } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';
import { listPhotosByShop } from '@/lib/repositories/photos';
import { ShopDetail } from '@/components/shop/ShopDetail';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await findShopById(id);
  if (!shop) notFound();
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
