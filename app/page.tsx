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

  // Debounced fetch for shops/feed when filters change
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

  return (
    <main className="md:flex md:gap-0 md:h-[calc(100vh-49px)] pb-16 md:pb-0">
      {/* Left pane (PC) / single tab (mobile) */}
      <section
        className={`${tab === 'list' || tab === 'feed' ? 'block' : 'hidden'} md:block md:w-1/2 md:max-w-md md:border-r md:border-neutral-200 md:overflow-y-auto p-4 space-y-4`}
      >
        <FilterBar filters={filters} onChange={setFilters} />
        {/* On PC always show list; on mobile show list or feed */}
        <div className={`${tab === 'list' ? 'block' : 'hidden md:block'}`}>
          <ShopList shops={shops} loading={shopsLoading} />
        </div>
        <div className={`${tab === 'feed' ? 'block' : 'hidden'} md:hidden`}>
          <Feed items={feed} loading={feedLoading} />
        </div>
      </section>

      {/* Right pane: map (md+) / mobile map tab */}
      <section
        className={`${tab === 'map' ? 'block' : 'hidden'} md:block md:flex-1 h-[calc(100vh-49px-64px)] md:h-auto`}
      >
        <MapView shops={shops} onSelect={(id) => (window.location.href = `/shops/${id}`)} />
      </section>

      {/* Feed on PC: separate section visible only when tab=feed (PC-specific layout) */}
      {tab === 'feed' && (
        <section className="hidden md:block md:absolute md:inset-0 md:bg-white md:overflow-y-auto md:p-6 md:z-10">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold">みんなの共有</h2>
            <FilterBar filters={filters} onChange={setFilters} />
            <Feed items={feed} loading={feedLoading} />
          </div>
        </section>
      )}

      {/* PC: top-right Feed button to toggle feed view */}
      <button
        type="button"
        onClick={() => setTab(tab === 'feed' ? 'list' : 'feed')}
        className="hidden md:block fixed top-2 right-32 z-20 text-xs underline text-neutral-600"
      >
        {tab === 'feed' ? '← ホームへ戻る' : '🆕 みんなの共有'}
      </button>

      {/* PC: top-right post button */}
      <button
        type="button"
        onClick={() => setComposing(true)}
        className="hidden md:block fixed top-2 right-4 z-20 rounded-full bg-neutral-900 text-white px-4 py-1.5 text-sm font-medium"
      >
        ＋ 投稿
      </button>

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
