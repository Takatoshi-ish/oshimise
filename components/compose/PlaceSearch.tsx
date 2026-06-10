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
      <label className="block text-sm font-medium mb-1">店名 *</label>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="例: 渋谷ラーメン"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-base"
      />
      {loading && (
        <div className="text-xs text-neutral-500 mt-1">候補を取得中...</div>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-1 border border-neutral-200 rounded bg-white max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s);
                  setSuggestions([]);
                  setQ(s.description);
                }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-sm"
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
