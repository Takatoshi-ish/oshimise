'use client';

export type HomeTab = 'map' | 'list' | 'feed';

type Props = {
  active: HomeTab;
  onChange: (t: HomeTab) => void;
};

const ITEMS: { id: HomeTab; icon: string; label: string }[] = [
  { id: 'map', icon: '🗺️', label: '地図' },
  { id: 'list', icon: '📋', label: 'さがす' },
  { id: 'feed', icon: '🆕', label: '共有' },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white md:hidden">
      <ul className="flex">
        {ITEMS.map((it) => {
          const isActive = it.id === active;
          return (
            <li key={it.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(it.id)}
                className={`w-full py-2 text-xs flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'text-neutral-900 font-semibold'
                    : 'text-neutral-500'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-lg" aria-hidden>{it.icon}</span>
                {it.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
