'use client';

type Props = {
  value: number | null;
  onChange: (v: number | null) => void;
};

const PRICES: { value: number; mark: string; range: string }[] = [
  { value: 1, mark: '¥', range: '〜1,000円' },
  { value: 2, mark: '¥¥', range: '1,000〜3,000円' },
  { value: 3, mark: '¥¥¥', range: '3,000〜10,000円' },
  { value: 4, mark: '¥¥¥¥', range: '10,000円〜' },
];

export function PriceSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">価格帯（任意）</label>
      <div className="grid grid-cols-5 gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-2 py-2 rounded border text-xs flex flex-col items-center justify-center ${
            value === null
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'border-neutral-300'
          }`}
        >
          <span className="font-medium">不明</span>
          <span className="text-[10px] opacity-70 mt-0.5">設定しない</span>
        </button>
        {PRICES.map((p) => {
          const selected = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`px-2 py-2 rounded border text-xs flex flex-col items-center justify-center ${
                selected
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-300'
              }`}
            >
              <span className="font-medium">{p.mark}</span>
              <span className="text-[10px] opacity-70 mt-0.5">{p.range}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
