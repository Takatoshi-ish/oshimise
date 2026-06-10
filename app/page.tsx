'use client';
import { useEffect, useRef, useState } from 'react';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { FilterBar, type Filters } from '@/components/home/FilterBar';
import { ShopList, type ShopCard } from '@/components/home/ShopList';
import { MapView } from '@/components/home/MapView';
import { Feed, type FeedItem } from '@/components/home/Feed';
import { BottomNav, type HomeTab } from '@/components/home/BottomNav';

const INITIAL_FILTERS: Filters = {
  pref: '',
  genre: '',
  q: '',
  sort: 'new',
};

function buildShopsQS(f: Filters): string {
  const p = new URLSearchParams();
  if (f.pref) p.set('pref', f.pref);
  if (f.genre) p.set('genre', f.genre);
  if (f.q) p.set('q', f.q);
  if (f.sort) p.set('sort', f.sort);
  return p.toString();
}

function buildFeedQS(f: Filters): string {
  const p = new URLSearchParams();
  if (f.pref) p.set('pref', f.pref);
  if (f.genre) p.set('genre', f.genre);
  return p.toString();
}

export default function HomePage() {
  const [tab, setTab] = useState<HomeTab>('list');
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
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

  useEffect(() => {
    setFeedLoading(true);
    fetch(`/api/feed?${buildFeedQS(filters)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFeed)
      .finally(() => setFeedLoading(false));
  }, [filters.pref, filters.genre]);

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

  // PC sub-tab highlight: 'map' state has no meaning on PC (map is always shown);
  // treat it as "list" for the tab strip.
  const pcActive: 'list' | 'feed' = tab === 'feed' ? 'feed' : 'list';

  return (
    <main className="md:flex md:gap-0 md:max-w-7xl md:mx-auto md:h-[calc(100vh-49px)] pb-16 md:pb-0">
      {/* Left pane: filter + (shop list | feed) */}
      <section
        className={`${tab === 'list' || tab === 'feed' ? 'block' : 'hidden'} md:block md:w-3/5 md:border-r md:border-neutral-200 md:overflow-y-auto`}
      >
        {/* PC-only top strip: sub-tabs + post button */}
        <div className="hidden md:flex sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-2 justify-between items-center">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab('list')}
              className={`px-3 py-1.5 text-sm rounded ${
                pcActive === 'list'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              📋 さがす
            </button>
            <button
              type="button"
              onClick={() => setTab('feed')}
              className={`px-3 py-1.5 text-sm rounded ${
                pcActive === 'feed'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              🆕 みんなの共有
            </button>
          </div>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="rounded-full bg-neutral-900 text-white px-4 py-1.5 text-sm font-medium"
          >
            ＋ 投稿
          </button>
        </div>

        <div className="p-4 space-y-4">
          <FilterBar filters={filters} onChange={setFilters} />
          <div className={pcActive === 'feed' ? 'hidden' : 'block'}>
            <ShopList shops={shops} loading={shopsLoading} />
          </div>
          <div className={pcActive === 'feed' ? 'block' : 'hidden'}>
            <Feed items={feed} loading={feedLoading} />
          </div>
        </div>
      </section>

      {/* Right pane: map (always on PC, mobile only when tab=map) */}
      <section
        className={`${tab === 'map' ? 'block' : 'hidden'} md:block md:w-2/5 h-[calc(100vh-49px-64px)] md:h-auto`}
      >
        <MapView
          shops={shops}
          onSelect={(id) => (window.location.href = `/shops/${id}`)}
        />
      </section>

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setComposing(true)}
        className="md:hidden fixed bottom-20 right-4 z-20 rounded-full bg-neutral-900 text-white px-5 py-4 shadow-lg font-medium"
        aria-label="投稿"
      >
        ＋ 投稿
      </button>

      <BottomNav active={tab} onChange={setTab} />

      {composing && <ComposeModal onClose={closeModal} />}
    </main>
  );
}
