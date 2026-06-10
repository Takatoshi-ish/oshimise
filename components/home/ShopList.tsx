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
    return <p className="text-sm text-neutral-500">読み込み中...</p>;
  }
  if (shops.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-neutral-600">
        <p className="text-base mb-1">まだお店がありません</p>
        <p className="mb-4">最初の1店を投稿しましょう!</p>
        {onPostClick && (
          <button
            type="button"
            onClick={onPostClick}
            className="rounded-lg bg-neutral-900 text-white px-5 py-3 font-medium"
          >
            ＋ お店を投稿する
          </button>
        )}
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {shops.map((s) => (
        <li
          key={s.id}
          className="border border-neutral-200 rounded-lg p-3 flex gap-3 bg-white"
        >
          {s.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.thumbnailUrl}
              alt=""
              className="w-16 h-16 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded bg-neutral-100 flex-shrink-0 flex items-center justify-center text-2xl text-neutral-300">
              🍴
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href={`/shops/${s.id}`}
              className="font-medium text-sm hover:underline block truncate"
            >
              {s.name}
            </Link>
            <div className="flex gap-2 items-center text-xs text-neutral-600 mt-1 flex-wrap">
              {s.genre && <span>🍴 {s.genre}</span>}
              {priceText(s.priceLevel) && <span>{priceText(s.priceLevel)}</span>}
              <span>💬 {s.shareCount}</span>
              {(s.pref || s.city || s.area) && (
                <span className="truncate">
                  📍 {s.area || s.city || s.pref}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
