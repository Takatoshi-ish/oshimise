'use client';
import Link from 'next/link';

export type ShopCard = {
  id: string;
  name: string;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  lat: number | null;
  lng: number | null;
  shareCount: number;
  thumbnailUrl: string | null;
};

type Props = {
  shops: ShopCard[];
  loading?: boolean;
  onPostClick?: () => void;
  /** Callback to build the /shops/[id] URL. Lets the parent inject
   *  viewerTeamId / viewerTeamSlug so the detail page can route back
   *  to the correct team home. */
  shopHref?: (id: string) => string;
};

function priceText(level: number | null): string {
  if (level === null) return '';
  if (level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

// Stable-ish color picker so the same shop gets the same monogram tint each render.
const MONOGRAM_PALETTE = [
  'from-coral-100 to-coral-50 text-coral-700',
  'from-sea-100 to-sea-50 text-sea-700',
  'from-cream-200 to-cream-100 text-ink-600',
] as const;

function monogramTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return MONOGRAM_PALETTE[Math.abs(hash) % MONOGRAM_PALETTE.length];
}

export function ShopList({ shops, loading, onPostClick, shopHref }: Props) {
  const buildHref = shopHref ?? ((id: string) => `/shops/${id}`);
  if (loading) {
    return <p className="text-sm text-ink-400">読み込み中...</p>;
  }
  if (shops.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-cream-100 p-10 text-center space-y-3">
        <p className="text-4xl" aria-hidden>✨</p>
        <p className="text-lg font-bold text-ink-900">
          まだお店がありません
        </p>
        <p className="text-sm text-ink-500">
          書店・カフェ・雑貨…なんでも。最初の1店をシェアしてみよう
        </p>
        {onPostClick && (
          <button
            type="button"
            onClick={onPostClick}
            className="mt-2 rounded-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-2.5 text-sm font-semibold transition-colors"
          >
            ＋ お店を投稿する
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-1.5 text-xs px-1">
        <span className="text-ink-400 font-medium">全</span>
        <span className="text-ink-900 font-bold text-sm">{shops.length}</span>
        <span className="text-ink-400 font-medium">件</span>
      </div>
      <ul className="space-y-2">
        {shops.map((s) => (
          <li key={s.id}>
            <Link
              href={buildHref(s.id)}
              className="group block rounded-2xl bg-white border border-cream-100 hover:border-coral-200 hover:bg-coral-50/30 transition-colors p-3.5 flex gap-3"
            >
              {s.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.thumbnailUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${monogramTint(s.id)} flex-shrink-0 flex items-center justify-center text-xl font-extrabold`}
                  aria-hidden
                >
                  {s.name.slice(0, 1)}
                </div>
              )}
              <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center">
                <p className="font-semibold text-ink-900 truncate group-hover:text-coral-700 transition-colors">
                  {s.name}
                </p>
                <div className="flex gap-1.5 items-center mt-1.5 flex-wrap">
                  {s.genre && (
                    <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-coral-50 text-coral-700 font-semibold">
                      {s.genre}
                    </span>
                  )}
                  {priceText(s.priceLevel) && (
                    <span className="text-[11px] text-ink-500 font-semibold">
                      {priceText(s.priceLevel)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-sea-50 text-sea-700 font-semibold">
                    💬 {s.shareCount}
                  </span>
                </div>
                {(s.pref || s.city || s.area) && (
                  <p className="mt-1.5 text-[11px] text-ink-400 truncate">
                    {s.area || s.city || s.pref}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
