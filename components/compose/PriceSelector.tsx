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

function chipClass(selected: boolean): string {
  return `px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
    selected
      ? 'bg-coral-500 text-white border-coral-500 shadow-soft'
      : 'border-cream-200 bg-white text-ink-600 hover:border-coral-300 hover:text-coral-600'
  }`;
}

export function PriceSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        価格帯 <span className="text-ink-400 font-normal">（任意）</span>
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={chipClass(value === null)}
        >
          不明
        </button>
        {PRICES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={chipClass(value === p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
