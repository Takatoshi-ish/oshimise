'use client';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function ShareInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">みんなに共有 *</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={200}
        placeholder="なぜ良い？ 誰に・どんな時におすすめ？ 例：深夜営業でスープが絶品のラーメン。一人でも入りやすい"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
      />
      <p className="mt-1 text-xs text-neutral-500 text-right">
        {value.length}/200
      </p>
    </div>
  );
}
