'use client';

type Props = {
  value: number | null;
  onChange: (v: number | null) => void;
};

const LABELS = ['¥', '¥¥', '¥¥¥', '¥¥¥¥'];

export function PriceSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">価格帯（任意）</label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-3 py-1 rounded border text-sm ${
            value === null
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'border-neutral-300'
          }`}
        >
          不明
        </button>
        {LABELS.map((label, i) => {
          const v = i + 1;
          const selected = value === v;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(v)}
              className={`px-3 py-1 rounded border text-sm ${
                selected
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
