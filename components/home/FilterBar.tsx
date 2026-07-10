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

const SELECT_CLASS =
  'w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 appearance-none bg-no-repeat pr-10 cursor-pointer';

// SVG chevron rendered as a background image so we can hide the native
// select arrow (which varies per OS) and keep our own on the right side.
const SELECT_STYLE: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237C746A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
  backgroundSize: '16px 16px',
  backgroundPosition: 'right 12px center',
};

const FREE_TEXT_CLASS =
  'w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100';

export function FilterBar({ filters, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeCount =
    (filters.pref ? 1 : 0) + (filters.genre ? 1 : 0);

  const setPref = (v: string) => onChange({ ...filters, pref: v });
  const setGenre = (v: string) => onChange({ ...filters, genre: v });

  // "true" means the current pref value is one of the known options —
  // if not, we route it to the free-text input so both stay in sync.
  const knownPref =
    POPULAR_PREFS.includes(filters.pref) || OTHER_PREFS.includes(filters.pref);
  const knownGenre = GENRE_SUGGESTIONS.includes(filters.genre);

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
        <div className="rounded-2xl border border-cream-200 bg-white p-4 space-y-4 shadow-soft">
          {/* 都道府県 */}
          <section>
            <div className="flex items-baseline justify-between mb-1.5">
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
            <select
              value={knownPref ? filters.pref : ''}
              onChange={(e) => setPref(e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">全国</option>
              <optgroup label="よく使う">
                {POPULAR_PREFS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </optgroup>
              <optgroup label="その他">
                {OTHER_PREFS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </optgroup>
            </select>
            <input
              type="text"
              value={knownPref ? '' : filters.pref}
              onChange={(e) => setPref(e.target.value)}
              placeholder="上記以外を入力"
              className={`mt-2 ${FREE_TEXT_CLASS}`}
            />
          </section>

          {/* ジャンル */}
          <section className="pt-4 border-t border-cream-100">
            <div className="flex items-baseline justify-between mb-1.5">
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
            <select
              value={knownGenre ? filters.genre : ''}
              onChange={(e) => setGenre(e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">すべて</option>
              {GENRE_SUGGESTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={knownGenre ? '' : filters.genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="上記以外を入力"
              className={`mt-2 ${FREE_TEXT_CLASS}`}
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
