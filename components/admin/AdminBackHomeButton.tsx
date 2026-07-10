'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// "ホームに戻る" from /admin. If the admin arrived here from /t/<slug>,
// hop back to that team's URL; otherwise fall back to "/".
export function AdminBackHomeButton() {
  const [href, setHref] = useState('/');
  useEffect(() => {
    try {
      const ref = document.referrer;
      if (ref) {
        const u = new URL(ref);
        // Only trust same-origin referrers so we don't build a link out of
        // an external URL if the admin opened the tab from elsewhere.
        if (u.origin === window.location.origin) {
          const m = u.pathname.match(/^\/t\/([^/]+)/);
          if (m) setHref(`/t/${m[1]}`);
        }
      }
    } catch {
      /* Malformed referrer or SSR — keep "/" */
    }
  }, []);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-coral-600 px-3 py-1.5 rounded-full bg-white border border-cream-100 hover:border-coral-200 hover:bg-coral-50 transition-colors"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      ホームに戻る
    </Link>
  );
}
