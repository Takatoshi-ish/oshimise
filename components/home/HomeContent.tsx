'use client';
import { useEffect, useRef, useState } from 'react';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { FilterBar, type Filters } from '@/components/home/FilterBar';
import { ShopList, type ShopCard } from '@/components/home/ShopList';
import { MapView } from '@/components/home/MapView';
import { BottomNav, type HomeTab } from '@/components/home/BottomNav';
import { ViewerTeamSwitcher } from '@/components/home/ViewerTeamSwitcher';
import {
  loadViewerTeamId,
  saveViewerTeamId,
  clearViewerTeamId,
} from '@/lib/viewerTeam';

const INITIAL_FILTERS: Filters = {
  pref: '',
  genres: [],
  q: '',
  sort: 'recent_share',
};

function buildShopsQS(f: Filters, viewerTeamId: string): string {
  const p = new URLSearchParams();
  if (f.pref) p.set('pref', f.pref);
  // Multi-select genres — repeated ?genre=A&genre=B params.
  for (const g of f.genres) if (g) p.append('genre', g);
  if (f.q) p.set('q', f.q);
  if (f.sort) p.set('sort', f.sort);
  if (viewerTeamId) p.set('viewerTeamId', viewerTeamId);
  return p.toString();
}

type Props = {
  /**
   * When set (via /t/[slug] route), viewer team is locked to this id.
   * The team switcher is hidden, ComposeModal's team dropdown is
   * hidden, and posts are attributed to this team.
   */
  lockedTeamId?: string;
  lockedTeamName?: string;
};

export function HomeContent({ lockedTeamId, lockedTeamName }: Props) {
  const [tab, setTab] = useState<HomeTab>('list');
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  // On free "/" route this restores from localStorage. On /t/[slug]
  // routes it's forced to the URL's team.
  const [viewerTeamId, setViewerTeamId] = useState<string>(
    lockedTeamId ?? '',
  );
  const [hydrated, setHydrated] = useState(false);
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lockedTeamId) {
      setViewerTeamId(lockedTeamId);
      setHydrated(true);
      return;
    }
    const stored = loadViewerTeamId();
    if (stored) setViewerTeamId(stored);
    setHydrated(true);
  }, [lockedTeamId]);

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

  const handleViewerChange = (id: string) => {
    setViewerTeamId(id);
    if (id) saveViewerTeamId(id);
    else clearViewerTeamId();
  };

  const isLocked = !!lockedTeamId;

  return (
    <main className="md:flex md:gap-0 md:max-w-7xl md:mx-auto md:h-[calc(100vh-60px)] pb-16 md:pb-0">
      {/* Left pane */}
      <section
        className={`${tab === 'list' ? 'block' : 'hidden'} md:block md:w-3/5 md:border-r md:border-cream-100 md:overflow-y-auto`}
      >
        {/* PC top bar */}
        <div className="hidden md:flex sticky top-0 z-10 bg-cream-50/85 backdrop-blur-md border-b border-cream-100 px-6 py-3 justify-between items-center gap-3">
          <div className="flex flex-col leading-tight min-w-0">
            {isLocked && lockedTeamName ? (
              <>
                <p className="text-sm font-bold text-ink-900 truncate">
                  {lockedTeamName} の推し店
                </p>
                <p className="text-[11px] text-ink-400 font-medium mt-0.5 truncate">
                  書店・カフェ・雑貨…道中の発見をシェア
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-ink-900 truncate">
                  みんなで推し店を集めよう
                </p>
                <p className="text-[11px] text-ink-400 font-medium mt-0.5 truncate">
                  書店・カフェ・雑貨…道中の発見をシェア
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isLocked && (
              <ViewerTeamSwitcher
                value={viewerTeamId}
                onChange={handleViewerChange}
              />
            )}
            <button
              type="button"
              onClick={openCompose}
              className="rounded-full bg-coral-500 hover:bg-coral-600 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              ＋ お店を投稿
            </button>
          </div>
        </div>

        {/* Mobile thin sub-bar */}
        {isLocked && lockedTeamName ? (
          <div className="md:hidden flex items-center justify-end px-4 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 bg-coral-50 border border-coral-100 rounded-full px-3 py-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-coral-500"
                aria-hidden
              />
              {lockedTeamName}
            </span>
          </div>
        ) : (
          <div className="md:hidden flex items-center justify-end px-4 pt-3">
            <ViewerTeamSwitcher
              value={viewerTeamId}
              onChange={handleViewerChange}
            />
          </div>
        )}

        <div className="px-4 py-3 md:p-6 space-y-4">
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
        <MapView shops={shops} onSelect={goShop} onPostClick={openCompose} />
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
          lockedTeamId={lockedTeamId}
        />
      )}
    </main>
  );
}
