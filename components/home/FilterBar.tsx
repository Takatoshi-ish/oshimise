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

// Curated "よく使う" prefectures shown as chips. The remaining prefectures are
// reachable via the "他の都道府県 ▾" toggle so the panel stays scannable.
const POPULAR_PREFS = [
  '東京都', '神奈川県', '埼玉県', '千葉県',
  '大阪府', '京都府', '兵庫県',
  '愛知県', '福岡県', '北海道',
];

const OTHER_PREFS = [
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '三重県',
  '滋賀県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

function ChipButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
        selected
          ? 'bg-coral-500 text-white border-coral-500 font-semibold'
          : 'bg-white text-ink-700 border-cream-200 hover:border-coral-300 hover:bg-coral-50'
      }`}
    >
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showAllPrefs, setShowAllPrefs] = useState(false);
  const activeCount =
    (filters.pref ? 1 : 0) + (filters.genre ? 1 : 0);

  const setPref = (v: string) => onChange({ ...filters, pref: v });
  const setGenre = (v: string) => onChange({ ...filters, genre: v });

  return (
    <div className="space-y-3">
      {/* Search input */}
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
        <div className="rounded-2xl border border-cream-200 bg-white p-4 space-y-5 shadow-soft">
          {/* 都道府県 */}
          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-bold text-ink-900">都道府県</h4>
              {filters.pref && (
                <button
                  type="button"
                  onClick={() => setPref('')}
                  className="text-xs text-coral-600 hover:text-coral-700 font-medium underline"
                >
                  クリア
                </button>
              )}
            </div>
            <div className="relative -mx-4">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-1">
                {(showAllPrefs
                  ? [...POPULAR_PREFS, ...OTHER_PREFS]
                  : POPULAR_PREFS
                ).map((p) => (
                  <ChipButton
                    key={p}
                    label={p}
                    selected={filters.pref === p}
                    onClick={() => setPref(filters.pref === p ? '' : p)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowAllPrefs((v) => !v)}
                  className="flex-shrink-0 text-sm px-3 py-1.5 rounded-full border border-dashed border-cream-200 text-ink-500 hover:border-coral-300 hover:text-coral-600 transition-colors whitespace-nowrap"
                >
                  {showAllPrefs ? '閉じる' : '他 ▾'}
                </button>
              </div>
              {/* Fade hint at right edge to indicate horizontal scroll */}
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-white to-transparent"
                aria-hidden
              />
            </div>
            {/* Free-text fallback for anything else the chips don't cover */}
            <input
              type="text"
              value={
                POPULAR_PREFS.includes(filters.pref) ||
                OTHER_PREFS.includes(filters.pref)
                  ? ''
                  : filters.pref
              }
              onChange={(e) => setPref(e.target.value)}
              placeholder="上記以外を入力"
              className="mt-3 w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
            />
          </section>

          {/* ジャンル */}
          <section className="pt-4 border-t border-cream-100">
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-bold text-ink-900">ジャンル</h4>
              {filters.genre && (
                <button
                  type="button"
                  onClick={() => setGenre('')}
                  className="text-xs text-coral-600 hover:text-coral-700 font-medium underline"
                >
                  クリア
                </button>
              )}
            </div>
            <div className="relative -mx-4">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-1">
                {GENRE_SUGGESTIONS.map((g) => (
                  <ChipButton
                    key={g}
                    label={g}
                    selected={filters.genre === g}
                    onClick={() => setGenre(filters.genre === g ? '' : g)}
                  />
                ))}
              </div>
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-white to-transparent"
                aria-hidden
              />
            </div>
            {/* Free-text fallback */}
            <input
              type="text"
              value={GENRE_SUGGESTIONS.includes(filters.genre) ? '' : filters.genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="上記以外を入力"
              className="mt-3 w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
            />
          </section>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange({ pref: '', genre: '', q: filters.q, sort: filters.sort })
              }
              className="w-full rounded-full border border-cream-200 bg-white hover:bg-cream-100 text-ink-700 py-2 text-sm font-medium transition-colors"
            >
              フィルタをすべてクリア
            </button>
          )}
        </div>
      )}
    </div>
  );
}
