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
};

function priceText(level: number | null): string {
  if (level === null) return '';
  if (level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

export function ShopList({ shops, loading, onPostClick }: Props) {
  if (loading) {
    return <p className="text-sm text-ink-400">読み込み中...</p>;
  }
  if (shops.length === 0) {
    return (
      <div className="rounded-3xl bg-white shadow-card p-8 text-center space-y-3">
        <p className="text-4xl" aria-hidden>✨</p>
        <p className="text-base font-medium text-ink-900">
          まだお店がありません
        </p>
        <p className="text-sm text-ink-500">最初の1店を投稿しましょう!</p>
        {onPostClick && (
          <button
            type="button"
            onClick={onPostClick}
            className="rounded-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 text-sm font-semibold shadow-soft transition-colors"
          >
            ＋ お店を投稿する
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="text-xs text-ink-400 font-medium">
        全 <span className="text-ink-900 font-bold">{shops.length}</span> 件
      </div>
      <ul className="space-y-3">
        {shops.map((s) => (
          <li key={s.id}>
            <Link
              href={`/shops/${s.id}`}
              className="block rounded-2xl bg-white shadow-card hover:shadow-cardHover transition-shadow p-3 flex gap-3"
            >
              {s.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.thumbnailUrl}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-cream-100 flex-shrink-0 flex items-center justify-center text-3xl">
                  🍴
                </div>
              )}
              <div className="flex-1 min-w-0 py-0.5">
                <p className="font-semibold text-ink-900 truncate">{s.name}</p>
                <div className="flex gap-1.5 items-center mt-1.5 flex-wrap">
                  {s.genre && (
                    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-coral-50 text-coral-700 font-medium">
                      {s.genre}
                    </span>
                  )}
                  {priceText(s.priceLevel) && (
                    <span className="text-xs text-ink-500 font-medium">
                      {priceText(s.priceLevel)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-sea-50 text-sea-700 font-medium">
                    💬 {s.shareCount}
                  </span>
                </div>
                {(s.pref || s.city || s.area) && (
                  <p className="mt-1.5 text-xs text-ink-400 truncate">
                    📍 {s.area || s.city || s.pref}
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
