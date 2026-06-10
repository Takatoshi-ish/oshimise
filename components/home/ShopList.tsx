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
      <div className="rounded-3xl bg-gradient-to-br from-white to-cream-50 shadow-card p-10 text-center space-y-3">
        <p className="text-5xl" aria-hidden>✨</p>
        <p className="text-lg font-bold text-ink-900">
          まだお店がありません
        </p>
        <p className="text-sm text-ink-500">最初の1店を投稿してみましょう!</p>
        {onPostClick && (
          <button
            type="button"
            onClick={onPostClick}
            className="mt-2 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 text-white px-6 py-3 text-sm font-semibold shadow-soft hover:shadow-cardHover transition-all"
          >
            ＋ お店を投稿する
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-1.5 text-xs">
        <span className="text-ink-400 font-medium">全</span>
        <span className="text-ink-900 font-bold text-sm">{shops.length}</span>
        <span className="text-ink-400 font-medium">件</span>
      </div>
      <ul className="space-y-2.5">
        {shops.map((s) => (
          <li key={s.id}>
            <Link
              href={`/shops/${s.id}`}
              className="group block rounded-2xl bg-white shadow-card hover:shadow-cardHover transition-all hover:-translate-y-0.5 p-3.5 flex gap-3"
            >
              {s.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.thumbnailUrl}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200 flex-shrink-0 flex items-center justify-center text-3xl">
                  🍴
                </div>
              )}
              <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center">
                <p className="font-bold text-ink-900 truncate group-hover:text-coral-700 transition-colors">
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
