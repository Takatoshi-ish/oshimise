'use client';
import { timeAgo } from '@/lib/time';

export type Recommendation = {
  id: string;
  memberName: string;
  comment: string;
  createdAt: string;
};

export function ShareList({ items }: { items: Recommendation[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-400">まだ共有がありません</p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li
          key={r.id}
          className="rounded-2xl bg-white shadow-card border border-cream-100 p-4"
        >
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-coral-100 text-coral-700 font-semibold text-xs">
              {r.memberName.slice(0, 1)}
            </span>
            <span className="font-medium text-ink-600">{r.memberName}</span>
            <span>・</span>
            <span>{timeAgo(r.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap text-ink-900">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
