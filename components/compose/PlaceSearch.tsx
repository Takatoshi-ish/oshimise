'use client';
import { useEffect, useRef, useState } from 'react';

export type PlaceSuggestion = { placeId: string; description: string };

type Props = {
  sessionToken: string;
  onSelect: (suggestion: PlaceSuggestion) => void;
};

export function PlaceSearch({ sessionToken, onSelect }: Props) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(
          `/api/places/search?q=${encodeURIComponent(q.trim())}&sessiontoken=${encodeURIComponent(sessionToken)}`,
        );
        if (r.ok) {
          const data = (await r.json()) as PlaceSuggestion[];
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, sessionToken]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        店名 <span className="text-coral-500">*</span>
      </label>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="例: 下北沢の書店、渋谷のカフェ"
        className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
      />
      {loading && (
        <div className="text-xs text-ink-400 mt-1">候補を取得中...</div>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-1.5 border border-cream-200 rounded-2xl bg-white shadow-card max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s);
                  setSuggestions([]);
                  setQ(s.description);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-coral-50 text-sm transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
