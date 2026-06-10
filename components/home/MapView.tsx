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

function priceText(level: number | null): string {
  if (level === null || level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

function FitBounds({ shops }: { shops: ShopCard[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const pts = shops.filter(
      (s): s is ShopCard & { lat: number; lng: number } =>
        s.lat !== null && s.lng !== null,
    );
    if (pts.length === 0) {
      map.setCenter(MAP_DEFAULT_CENTER);
      map.setZoom(MAP_DEFAULT_ZOOM);
      return;
    }
    if (pts.length === 1) {
      map.setCenter({ lat: pts[0].lat, lng: pts[0].lng });
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    pts.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, 40);
  }, [map, shops]);
  return null;
}

export function MapView({ shops, onSelect, onPostClick }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-neutral-500 bg-neutral-50">
        地図表示にはブラウザキーが必要です
      </div>
    );
  }

  // Cold-start CTA
  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-neutral-50 text-center p-6 gap-3">
        <p className="text-2xl" aria-hidden>🗺️</p>
        <p className="text-sm text-neutral-700">
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

  const selected = shops.find((s) => s.id === selectedId);
  const pinnedShops = shops.filter(
    (s): s is ShopCard & { lat: number; lng: number } =>
      s.lat !== null && s.lng !== null,
  );

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={MAP_DEFAULT_CENTER}
        defaultZoom={MAP_DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="oshimise-home"
      >
        <FitBounds shops={shops} />
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
                {selected.genre && <span>🍴 {selected.genre}</span>}
                {priceText(selected.priceLevel) && (
                  <span>{priceText(selected.priceLevel)}</span>
                )}
                <span>💬 {selected.shareCount}</span>
                {(selected.area || selected.city) && (
                  <span>📍 {selected.area || selected.city}</span>
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
