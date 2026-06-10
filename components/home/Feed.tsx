'use client';
import Link from 'next/link';
import { timeAgo } from '@/lib/time';

export type FeedItem = {
  recommendationId: string;
  memberName: string;
  comment: string;
  createdAt: string;
  shop: {
    id: string;
    name: string;
    genre: string | null;
    pref: string | null;
    area: string | null;
    priceLevel: number | null;
  };
};

type Props = {
  items: FeedItem[];
  loading?: boolean;
};

function priceText(level: number | null): string {
  if (level === null || level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

export function Feed({ items, loading }: Props) {
  if (loading) {
    return <p className="text-sm text-neutral-500">読み込み中...</p>;
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-neutral-500">
        まだ共有がありません。
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li
          key={it.recommendationId}
          className="border border-neutral-200 rounded-lg p-3 bg-white"
        >
          <div className="text-xs text-neutral-500">
            👤 {it.memberName} ・ {timeAgo(it.createdAt)}
          </div>
          <Link
            href={`/shops/${it.shop.id}`}
            className="mt-1 block font-medium text-sm hover:underline"
          >
            🍴 {it.shop.name}
            {it.shop.area ? ` (${it.shop.area})` : it.shop.pref ? ` (${it.shop.pref})` : ''}
            {priceText(it.shop.priceLevel) && ` ${priceText(it.shop.priceLevel)}`}
          </Link>
          <p className="mt-1 text-sm text-neutral-800 whitespace-pre-wrap">
            {it.comment}
          </p>
        </li>
      ))}
    </ul>
  );
}
