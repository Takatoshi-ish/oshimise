import { notFound } from 'next/navigation';
import { findShopById, isShopVisibleToTeams } from '@/lib/repositories/shops';
import { listRecommendationsByShop } from '@/lib/repositories/recommendations';
import { listPhotosByShop } from '@/lib/repositories/photos';
import { findTeamById, listVisibleTeamIds } from '@/lib/repositories/teams';
import { ShopDetail } from '@/components/shop/ShopDetail';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ viewerTeamId?: string; viewerTeamSlug?: string }>;
}) {
  const { id } = await params;
  const { viewerTeamId, viewerTeamSlug } = await searchParams;
  const shop = await findShopById(id);
  if (!shop) notFound();

  // Enforce visibility server-side when the viewer team is known.
  const viewerTeam = viewerTeamId ? await findTeamById(viewerTeamId) : null;
  if (viewerTeam) {
    const visible = await listVisibleTeamIds(viewerTeam.id);
    const ok = await isShopVisibleToTeams(shop.id, visible);
    if (!ok) notFound();
  }

  // "ホームに戻る" target:
  //   • viewerTeamSlug present → /t/<slug>  (came from a team-scoped route)
  //   • otherwise             → /            (came from "/" / admin)
  // We deliberately don't fall back to the viewer team's slug here so the
  // default team ("/") flow stays on "/".
  const [recommendations, photos] = await Promise.all([
    listRecommendationsByShop(shop.id),
    listPhotosByShop(shop.id),
  ]);
  return (
    <ShopDetail
      shop={shop}
      recommendations={recommendations}
      photos={photos}
      viewerTeamSlug={viewerTeamSlug ?? null}
    />
  );
}
