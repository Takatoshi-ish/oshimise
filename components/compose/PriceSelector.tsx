'use client';

type Props = {
  value: number | null;
  onChange: (v: number | null) => void;
};

const PRICES: { value: number; label: string }[] = [
  { value: 1, label: '〜1,000円' },
  { value: 2, label: '1,000〜3,000円' },
  { value: 3, label: '3,000〜10,000円' },
  { value: 4, label: '10,000円〜' },
];

export function PriceSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">価格帯（任意）</label>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded border text-sm ${
            value === null
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'border-neutral-300'
          }`}
        >
          不明
        </button>
        {PRICES.map((p) => {
          const selected = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`px-3 py-1.5 rounded border text-sm ${
                selected
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-300'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
