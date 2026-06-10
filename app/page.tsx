'use client';
import { useEffect, useRef, useState } from 'react';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { FilterBar, type Filters } from '@/components/home/FilterBar';
import { ShopList, type ShopCard } from '@/components/home/ShopList';
import { MapView } from '@/components/home/MapView';
import { BottomNav, type HomeTab } from '@/components/home/BottomNav';
import { HelpBanner } from '@/components/home/HelpBanner';

const INITIAL_FILTERS: Filters = {
  pref: '',
  genre: '',
  q: '',
  sort: 'recent_share',
};

function buildShopsQS(f: Filters): string {
  const p = new URLSearchParams();
  if (f.pref) p.set('pref', f.pref);
  if (f.genre) p.set('genre', f.genre);
  if (f.q) p.set('q', f.q);
  if (f.sort) p.set('sort', f.sort);
  return p.toString();
}

export default function HomePage() {
  const [tab, setTab] = useState<HomeTab>('list');
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced fetch for shops when filters change
  useEffect(() => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(async () => {
      setShopsLoading(true);
      try {
        const r = await fetch(`/api/shops?${buildShopsQS(filters)}`);
        if (r.ok) setShops(await r.json());
      } finally {
        setShopsLoading(false);
      }
    }, 200);
    return () => {
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
    };
  }, [filters]);

  // Browser back closes the compose modal
  useEffect(() => {
    if (!composing) return;
    window.history.pushState({ oshimiseCompose: true }, '');
    const handler = () => setComposing(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [composing]);

  const closeModal = () => {
    if (composing) window.history.back();
  };

  const openCompose = () => setComposing(true);
  const goShop = (id: string) => {
    window.location.href = `/shops/${id}`;
  };

  return (
    <main className="md:flex md:gap-0 md:max-w-7xl md:mx-auto md:h-[calc(100vh-49px)] pb-16 md:pb-0">
      {/* Left pane: help + filter + shop list */}
      <section
        className={`${tab === 'list' ? 'block' : 'hidden'} md:block md:w-3/5 md:border-r md:border-neutral-200 md:overflow-y-auto`}
      >
        {/* PC-only top strip: just the post button (no sub-tabs needed since Feed is gone) */}
        <div className="hidden md:flex sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-2 justify-end items-center">
          <button
            type="button"
            onClick={openCompose}
            className="rounded-full bg-neutral-900 text-white px-4 py-1.5 text-sm font-medium"
          >
            ＋ お店を投稿
          </button>
        </div>

        <div className="p-4 space-y-4">
          <HelpBanner />
          <FilterBar filters={filters} onChange={setFilters} />
          <ShopList
            shops={shops}
            loading={shopsLoading}
            onPostClick={openCompose}
          />
        </div>
      </section>

      {/* Right pane: map (always on PC, mobile only when tab=map) */}
      <section
        className={`${tab === 'map' ? 'block' : 'hidden'} md:block md:w-2/5 h-[calc(100vh-49px-64px)] md:h-auto`}
      >
        <MapView
          shops={shops}
          onSelect={goShop}
          onPostClick={openCompose}
        />
      </section>

      {/* Mobile FAB with label so it's clearly the primary action */}
      <button
        type="button"
        onClick={openCompose}
        className="md:hidden fixed bottom-20 right-4 z-20 rounded-full bg-neutral-900 text-white px-5 py-4 shadow-lg font-medium text-base"
        aria-label="お店を投稿"
      >
        ＋ 投稿
      </button>

      <BottomNav active={tab} onChange={setTab} />

      {composing && <ComposeModal onClose={closeModal} />}
    </main>
  );
}
