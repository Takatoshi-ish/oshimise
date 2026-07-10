'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

/**
 * Genre combobox:
 *  - Fetches /api/genres (config union + distinct existing values) on mount.
 *  - As the user types, matching entries appear in a dropdown.
 *  - If the typed text doesn't exactly match any known genre, a
 *    「「XXX」を新規追加」row is appended so it can be committed as a new genre.
 *  - Selecting an item (existing or new) writes to the parent via onChange.
 */
export function GenreCombobox({ value, onChange }: Props) {
  const [all, setAll] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    fetch('/api/genres')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setAll(d))
      .catch(() => {});
  }, []);

  // Sync when the parent updates value externally (e.g. draft restore or
  // "select from Places genre suggestion" pre-fill).
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const q = query.trim();
  const lowerQ = q.toLowerCase();
  const matches = useMemo(() => {
    if (!q) return all.slice(0, 40);
    return all.filter((g) => g.toLowerCase().includes(lowerQ));
  }, [all, q, lowerQ]);
  const exact = q && all.some((g) => g === q);

  const pick = (v: string) => {
    onChange(v);
    setQuery(v);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-900 mb-1.5">
        ジャンル
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="text-ink-400"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          onChange(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="例: カフェ、書店、雑貨"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
      />
      {open && (matches.length > 0 || (q && !exact)) && (
        <ul
          ref={listRef}
          className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-cream-200 bg-white shadow-cardHover"
          role="listbox"
        >
          {matches.map((g) => (
            <li key={g}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(g)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-coral-50 transition-colors ${
                  g === value ? 'bg-coral-50 text-coral-700 font-semibold' : ''
                }`}
              >
                {g}
              </button>
            </li>
          ))}
          {q && !exact && (
            <li className="border-t border-cream-100">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(q)}
                className="w-full text-left px-4 py-2.5 text-sm text-coral-700 font-semibold hover:bg-coral-50 flex items-center gap-1.5 transition-colors"
              >
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-coral-500 text-white text-xs"
                  aria-hidden
                >
                  ＋
                </span>
                「{q}」を新規追加
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
