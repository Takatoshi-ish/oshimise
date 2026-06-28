'use client';
import { useState } from 'react';
import { GENRE_SUGGESTIONS } from '@/config/data';

export type Filters = {
  pref: string;
  genre: string;
  q: string;
  sort: 'new' | 'count' | 'recent_share';
};

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
};

const PREF_SUGGESTIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

export function FilterBar({ filters, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeCount =
    (filters.pref ? 1 : 0) + (filters.genre ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search input with leading icon */}
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-base pointer-events-none"
        >
          🔍
        </span>
        <input
          type="search"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="店名・キーワードで検索"
          className="w-full rounded-full border border-cream-200 bg-white pl-11 pr-4 py-3 text-sm shadow-soft focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition-colors"
        />
      </div>

      {/* Sort (left) + Filter toggle (right) */}
      <div className="flex items-center justify-between gap-2">
        <select
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as Filters['sort'] })
          }
          className="rounded-full border border-cream-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 cursor-pointer"
          aria-label="並び替え"
        >
          <option value="recent_share">最近共有された順</option>
          <option value="new">店の新着順</option>
          <option value="count">共有件数の多い順</option>
        </select>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            expanded || activeCount > 0
              ? 'bg-coral-50 border-coral-200 text-coral-700 hover:bg-coral-100'
              : 'bg-white border-cream-200 text-ink-700 hover:bg-cream-100'
          }`}
        >
          <span aria-hidden>🎚</span>
          フィルタ
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-coral-500 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Expandable filter panel */}
      {expanded && (
        <div className="rounded-2xl border border-cream-200 bg-white p-3 space-y-2.5 shadow-soft">
          <div>
            <label className="text-[11px] text-ink-500 font-semibold">
              都道府県
            </label>
            <input
              type="text"
              value={filters.pref}
              onChange={(e) => onChange({ ...filters, pref: e.target.value })}
              placeholder="例: 東京都"
              list="pref-suggestions"
              className="mt-0.5 w-full rounded-full border border-cream-200 bg-white px-3.5 py-1.5 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition-colors"
            />
            <datalist id="pref-suggestions">
              {PREF_SUGGESTIONS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-[11px] text-ink-500 font-semibold">
              ジャンル
            </label>
            <input
              type="text"
              value={filters.genre}
              onChange={(e) => onChange({ ...filters, genre: e.target.value })}
              placeholder="例: カフェ"
              list="genre-suggestions"
              className="mt-0.5 w-full rounded-full border border-cream-200 bg-white px-3.5 py-1.5 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition-colors"
            />
            <datalist id="genre-suggestions">
              {GENRE_SUGGESTIONS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange({ pref: '', genre: '', q: filters.q, sort: filters.sort })
              }
              className="text-xs text-coral-600 hover:text-coral-700 font-medium underline"
            >
              フィルタをクリア
            </button>
          )}
        </div>
      )}
    </div>
  );
}
