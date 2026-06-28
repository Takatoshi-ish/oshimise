'use client';
import { useEffect, useState } from 'react';
import { loadLastMemberName } from '@/lib/draft';

// Reads the "last selected poster" name from localStorage so the header can
// surface who's currently using the app. We listen on a custom event so the
// badge updates immediately after a post without a full page reload.
const EVENT = 'oshimise:lastMemberChanged';

export function HeaderUserBadge() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(loadLastMemberName());
    const handler = () => setName(loadLastMemberName());
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (!name) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 max-w-[8rem] truncate"
      title={`${name}さん`}
    >
      <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden />
      <span className="truncate">{name}さん</span>
    </span>
  );
}

/** Dispatch this after saveLastMemberName so other tabs/components react instantly. */
export function notifyLastMemberChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT));
}
