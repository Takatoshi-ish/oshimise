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

  // Browser back closes the modal
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
    <main className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-neutral-500 hover:underline">
          ← ホーム
        </Link>
      </div>

      <PhotoGallery photos={photos} />

      <header>
        <h1 className="text-xl font-bold">{shop.name}</h1>
        <div className="mt-1 text-sm text-neutral-700 flex gap-2 flex-wrap">
          {shop.genre && <span>🍴 {shop.genre}</span>}
          {priceText(shop.priceLevel) && <span>{priceText(shop.priceLevel)}</span>}
          {(shop.area || shop.city || shop.pref) && (
            <span>📍 {shop.area || shop.city || shop.pref}</span>
          )}
        </div>
        {shop.address && (
          <p className="mt-1 text-xs text-neutral-600">{shop.address}</p>
        )}
        {shop.gmapUrl && (
          <a
            href={shop.gmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-700 underline"
          >
            Googleマップで開く →
          </a>
        )}
      </header>

      <section>
        <h2 className="text-base font-medium mb-3">
          みんなの共有 ({recommendations.length})
        </h2>
        <ShareList items={recommendations} />
      </section>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="w-full rounded-lg bg-neutral-900 text-white py-3 font-medium"
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
