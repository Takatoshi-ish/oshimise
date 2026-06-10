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
      <p className="text-sm text-neutral-500">まだ共有がありません</p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li
          key={r.id}
          className="border border-neutral-200 rounded p-3 bg-white"
        >
          <div className="text-xs text-neutral-500">
            👤 {r.memberName} ・ {timeAgo(r.createdAt)}
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
