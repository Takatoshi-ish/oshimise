'use client';
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

const inputClass =
  'rounded-full border border-cream-200 bg-white px-4 py-2 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition-colors';

export function FilterBar({ filters, onChange }: Props) {
  const hasAnyFilter =
    filters.pref || filters.genre || filters.q;

  return (
    <div className="space-y-3">
      <div className="text-xs text-ink-400 font-semibold tracking-wide uppercase">
        🔍 絞り込み
      </div>
      <input
        type="search"
        value={filters.q}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        placeholder="店名・料理・食材で検索"
        className={`${inputClass} w-full`}
      />
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          value={filters.pref}
          onChange={(e) => onChange({ ...filters, pref: e.target.value })}
          placeholder="都道府県"
          list="pref-suggestions"
          className={`${inputClass} w-32`}
        />
        <datalist id="pref-suggestions">
          {PREF_SUGGESTIONS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <input
          type="text"
          value={filters.genre}
          onChange={(e) => onChange({ ...filters, genre: e.target.value })}
          placeholder="ジャンル"
          list="genre-suggestions"
          className={`${inputClass} w-32`}
        />
        <datalist id="genre-suggestions">
          {GENRE_SUGGESTIONS.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        <select
          value={filters.sort}
          onChange={(e) =>
            onChange({
              ...filters,
              sort: e.target.value as Filters['sort'],
            })
          }
          className={`${inputClass} pr-3 cursor-pointer`}
          aria-label="並び替え"
        >
          <option value="new">店の新着順</option>
          <option value="recent_share">最近共有された順</option>
          <option value="count">共有件数の多い順</option>
        </select>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={() =>
              onChange({ pref: '', genre: '', q: '', sort: filters.sort })
            }
            className="text-xs text-coral-600 hover:text-coral-700 underline"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  );
}
