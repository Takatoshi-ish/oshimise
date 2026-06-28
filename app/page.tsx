'use client';
import { useEffect, useRef, useState } from 'react';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { FilterBar, type Filters } from '@/components/home/FilterBar';
import { ShopList, type ShopCard } from '@/components/home/ShopList';
import { MapView } from '@/components/home/MapView';
import { BottomNav, type HomeTab } from '@/components/home/BottomNav';
import { HelpBanner } from '@/components/home/HelpBanner';
import { ViewerTeamPicker } from '@/components/home/ViewerTeamPicker';
import { ViewerTeamSwitcher } from '@/components/home/ViewerTeamSwitcher';
import { loadViewerTeamId, saveViewerTeamId } from '@/lib/viewerTeam';

const INITIAL_FILTERS: Filters = {
  pref: '',
  genre: '',
  q: '',
  sort: 'recent_share',
};

function buildShopsQS(f: Filters, viewerTeamId: string | null): string {
  const p = new URLSearchParams();
  if (f.pref) p.set('pref', f.pref);
  if (f.genre) p.set('genre', f.genre);
  if (f.q) p.set('q', f.q);
  if (f.sort) p.set('sort', f.sort);
  if (viewerTeamId) p.set('viewerTeamId', viewerTeamId);
  return p.toString();
}

export default function HomePage() {
  const [tab, setTab] = useState<HomeTab>('list');
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const [viewerTeamId, setViewerTeamId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve viewer team from localStorage on mount
  useEffect(() => {
    setViewerTeamId(loadViewerTeamId());
    setHydrated(true);
  }, []);

  // Fetch shops only after we've resolved viewer team (avoid initial flash)
  useEffect(() => {
    if (!hydrated) return;
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(async () => {
      setShopsLoading(true);
      try {
        const r = await fetch(`/api/shops?${buildShopsQS(filters, viewerTeamId)}`);
        if (r.ok) setShops(await r.json());
      } finally {
        setShopsLoading(false);
      }
    }, 200);
    return () => {
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
    };
  }, [filters, refetchKey, viewerTeamId, hydrated]);

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
    const qs = viewerTeamId ? `?viewerTeamId=${viewerTeamId}` : '';
    window.location.href = `/shops/${id}${qs}`;
  };

  const needPicker = hydrated && !viewerTeamId;

  return (
    <>
      <main className="md:flex md:gap-0 md:max-w-7xl md:mx-auto md:h-[calc(100vh-60px)] pb-16 md:pb-0">
        {/* Left pane */}
        <section
          className={`${tab === 'list' ? 'block' : 'hidden'} md:block md:w-3/5 md:border-r md:border-cream-100 md:overflow-y-auto`}
        >
          {/* PC top bar */}
          <div className="hidden md:flex sticky top-0 z-10 bg-cream-50/85 backdrop-blur-md border-b border-cream-100 px-6 py-3.5 justify-between items-center gap-3">
            <div className="flex flex-col leading-tight min-w-0">
              <p className="text-base font-bold text-ink-900 truncate">
                みんなで推し店を集めよう
              </p>
              <p className="text-xs text-ink-400 font-medium mt-0.5 truncate">
                書店・カフェ・雑貨…道中の発見をシェア
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <ViewerTeamSwitcher
                value={viewerTeamId ?? ''}
                onChange={(id) => {
                  setViewerTeamId(id);
                  saveViewerTeamId(id);
                }}
              />
              <button
                type="button"
                onClick={openCompose}
                className="rounded-full bg-coral-500 hover:bg-coral-600 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                ＋ お店を投稿
              </button>
            </div>
          </div>

          {/* Mobile mini header (viewer team switcher) */}
          <div className="md:hidden px-4 pt-3 flex items-center justify-end">
            <ViewerTeamSwitcher
              value={viewerTeamId ?? ''}
              onChange={(id) => {
                setViewerTeamId(id);
                saveViewerTeamId(id);
              }}
            />
          </div>

          <div className="p-4 md:p-6 space-y-5">
            <HelpBanner />
            <FilterBar filters={filters} onChange={setFilters} />
            <ShopList
              shops={shops}
              loading={shopsLoading}
              onPostClick={openCompose}
            />
          </div>
        </section>

        {/* Right pane: map */}
        <section
          className={`${tab === 'map' ? 'block' : 'hidden'} md:block md:w-2/5 h-[calc(100vh-60px-56px)] md:h-auto`}
        >
          <MapView
            shops={shops}
            onSelect={goShop}
            onPostClick={openCompose}
          />
        </section>

        {/* Mobile FAB */}
        <button
          type="button"
          onClick={openCompose}
          className="md:hidden fixed bottom-20 right-4 z-20 rounded-full bg-coral-500 hover:bg-coral-600 text-white px-5 py-3.5 shadow-card font-semibold text-base transition-colors"
          aria-label="お店を投稿"
        >
          ＋ 投稿
        </button>

        <BottomNav active={tab} onChange={setTab} />

        {composing && (
          <ComposeModal
            onClose={closeModal}
            onPosted={() => setRefetchKey((k) => k + 1)}
          />
        )}
      </main>

      {/* First-visit team picker modal */}
      {needPicker && (
        <ViewerTeamPicker
          onPick={(id) => setViewerTeamId(id)}
        />
      )}
    </>
  );
}
