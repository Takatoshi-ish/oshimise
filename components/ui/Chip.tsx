'use client';

type Props = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

export function Chip({ label, active, onClick, ariaLabel }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      aria-label={ariaLabel}
      className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
        active
          ? 'bg-neutral-900 text-white border-neutral-900'
          : 'border-neutral-300 text-neutral-700 bg-white'
      }`}
    >
      {label}
    </button>
  );
}
