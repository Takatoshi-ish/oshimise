'use client';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function ShareInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        みんなに共有 <span className="text-coral-500">*</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={200}
        placeholder="なぜ良い？ 誰に・どんな時におすすめ？ 例：深夜営業でスープが絶品のラーメン。一人でも入りやすい"
        className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 resize-none"
      />
      <p className="mt-1 text-xs text-ink-400 text-right">
        {value.length}/200
      </p>
    </div>
  );
}
