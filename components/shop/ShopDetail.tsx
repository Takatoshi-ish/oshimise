'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PhotoGallery } from './PhotoGallery';
import { ShareList, type Recommendation } from './ShareList';
import { MergeView } from '@/components/compose/MergeView';

type Shop = {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  gmapUrl: string | null;
};

type Photo = { id: string; url: string };

type Props = {
  shop: Shop;
  recommendations: Recommendation[];
  photos: Photo[];
};

function priceText(level: number | null): string {
  if (level === null || level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

export function ShopDetail({ shop, recommendations, photos }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!adding) return;
    window.history.pushState({ oshimiseAddShare: true }, '');
    const handler = () => setAdding(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [adding]);

  const handleClose = () => {
    if (adding) window.history.back();
  };

  return (
    <main className="p-4 pb-24 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-ink-500 hover:text-coral-600 transition-colors"
        >
          ← ホーム
        </Link>
      </div>

      <PhotoGallery photos={photos} />

      <div className="rounded-3xl bg-white shadow-card p-5 space-y-3">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {shop.name}
          </h1>
          <div className="mt-2 flex gap-2 flex-wrap items-center">
            {shop.genre && (
              <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-coral-50 text-coral-700 font-medium">
                {shop.genre}
              </span>
            )}
            {priceText(shop.priceLevel) && (
              <span className="text-sm text-ink-500 font-medium">
                {priceText(shop.priceLevel)}
              </span>
            )}
            {(shop.area || shop.city || shop.pref) && (
              <span className="text-xs text-ink-500">
                {shop.area || shop.city || shop.pref}
              </span>
            )}
          </div>
          {shop.address && (
            <p className="mt-2 text-xs text-ink-400">{shop.address}</p>
          )}
          {shop.gmapUrl && (
            <a
              href={shop.gmapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-sea-600 hover:text-sea-700 font-medium"
            >
              Googleマップで開く →
            </a>
          )}
        </header>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink-900 px-1">
          みんなの共有
          <span className="ml-1.5 text-coral-600">{recommendations.length}</span>
        </h2>
        <ShareList items={recommendations} />
      </section>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="w-full rounded-full bg-coral-500 hover:bg-coral-600 text-white py-3.5 font-semibold shadow-soft transition-colors"
      >
        ＋ 共有を追加
      </button>

      {adding && (
        <MergeView
          shop={{
            id: shop.id,
            name: shop.name,
            pref: shop.pref,
            city: shop.city,
            area: shop.area,
            priceLevel: shop.priceLevel,
            genre: shop.genre,
          }}
          existingRecommendations={recommendations}
          onClose={handleClose}
          onAdded={() => router.refresh()}
        />
      )}
    </main>
  );
}
