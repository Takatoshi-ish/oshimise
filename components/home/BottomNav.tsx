'use client';

export type HomeTab = 'map' | 'list';

type Props = {
  active: HomeTab;
  onChange: (t: HomeTab) => void;
};

const ITEMS: { id: HomeTab; icon: string; label: string }[] = [
  { id: 'list', icon: '📋', label: '一覧' },
  { id: 'map', icon: '🗺️', label: '地図' },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cream-100 bg-white/95 backdrop-blur md:hidden">
      <ul className="flex">
        {ITEMS.map((it) => {
          const isActive = it.id === active;
          return (
            <li key={it.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(it.id)}
                className={`relative w-full py-2.5 text-xs flex flex-col items-center gap-0.5 transition-colors ${
                  isActive ? 'text-coral-600' : 'text-ink-400'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}
                  aria-hidden
                >
                  {it.icon}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{it.label}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-coral-500" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
