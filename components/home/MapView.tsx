'use client';
import { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import type { ShopCard } from './ShopList';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/config/data';

type Props = {
  shops: ShopCard[];
  onSelect?: (id: string) => void;
  onPostClick?: () => void;
};

type SavedView = { lat: number; lng: number; zoom: number };

const VIEW_KEY = 'oshimise:mapView';
const GEO_TIMEOUT_MS = 4000;
const GEO_ZOOM = 14;

function loadLastView(): SavedView | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(VIEW_KEY);
    return raw ? (JSON.parse(raw) as SavedView) : null;
  } catch {
    return null;
  }
}

function saveView(v: SavedView): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIEW_KEY, JSON.stringify(v));
  } catch {
    /* quota or disabled — ignore */
  }
}

function priceText(level: number | null): string {
  if (level === null || level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

// Save the current map view to localStorage every time the camera settles
function ViewPersister() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('idle', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (center && typeof zoom === 'number') {
        saveView({ lat: center.lat(), lng: center.lng(), zoom });
      }
    });
    return () => listener.remove();
  }, [map]);
  return null;
}

export function MapView({ shops, onSelect, onPostClick }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initial, setInitial] = useState<SavedView | null>(null);

  // Resolve initial view: geolocation → last view → app default
  useEffect(() => {
    const last = loadLastView();
    const fallback: SavedView = last ?? {
      lat: MAP_DEFAULT_CENTER.lat,
      lng: MAP_DEFAULT_CENTER.lng,
      zoom: MAP_DEFAULT_ZOOM,
    };

    if (!('geolocation' in navigator)) {
      setInitial(fallback);
      return;
    }

    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      setInitial(fallback);
    }, GEO_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        setInitial({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          zoom: GEO_ZOOM,
        });
      },
      () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        setInitial(fallback);
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 60_000 },
    );

    return () => clearTimeout(timeoutId);
  }, []);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-neutral-500 bg-neutral-50">
        地図表示にはブラウザキーが必要です
      </div>
    );
  }

  // Cold-start CTA when there are no shops yet
  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-neutral-50 text-center p-6 gap-3">
        <p className="text-2xl" aria-hidden>🗺️</p>
        <p className="text-sm text-ink-600">
          投稿された店のピンが地図に出ます
        </p>
        <p className="text-xs text-neutral-500">まだ投稿がありません</p>
        {onPostClick && (
          <button
            type="button"
            onClick={onPostClick}
            className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium"
          >
            ＋ 最初の店を投稿する
          </button>
        )}
      </div>
    );
  }

  // Wait until the initial view is decided to avoid a flash of the default center
  if (!initial) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-neutral-500 bg-neutral-50">
        現在地を取得中...
      </div>
    );
  }

  const selected = shops.find((s) => s.id === selectedId);
  const pinnedShops = shops.filter(
    (s): s is ShopCard & { lat: number; lng: number } =>
      s.lat !== null && s.lng !== null,
  );

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: initial.lat, lng: initial.lng }}
        defaultZoom={initial.zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="oshimise-home"
      >
        <ViewPersister />
        {pinnedShops.map((s) => (
          <Marker
            key={s.id}
            position={{ lat: s.lat, lng: s.lng }}
            title={s.name}
            onClick={() => setSelectedId(s.id)}
          />
        ))}
        {selected && selected.lat !== null && selected.lng !== null && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            pixelOffset={[0, -32]}
            onCloseClick={() => setSelectedId(null)}
          >
            <div className="text-sm min-w-48">
              <div className="font-medium">{selected.name}</div>
              <div className="text-xs text-neutral-600 mt-1 flex gap-2 flex-wrap">
                {selected.genre && <span>{selected.genre}</span>}
                {priceText(selected.priceLevel) && (
                  <span>{priceText(selected.priceLevel)}</span>
                )}
                <span>💬 {selected.shareCount}</span>
                {(selected.area || selected.city) && (
                  <span>{selected.area || selected.city}</span>
                )}
              </div>
              <div className="mt-2 flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => onSelect?.(selected.id)}
                  className="text-blue-700 underline"
                >
                  詳細を見る →
                </button>
                <button
                  type="button"
                  onClick={() => onSelect?.(selected.id)}
                  className="text-blue-700 underline"
                >
                  ＋ 共有を追加
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
