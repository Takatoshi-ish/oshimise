'use client';
import { useEffect } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import type { ShopCard } from './ShopList';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/config/data';

type Props = {
  shops: ShopCard[];
  onSelect?: (id: string) => void;
};

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

export function MapView({ shops, onSelect }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY;
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-neutral-500 bg-neutral-50">
        地図表示にはブラウザキーが必要です
      </div>
    );
  }
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
        {shops
          .filter(
            (s): s is ShopCard & { lat: number; lng: number } =>
              s.lat !== null && s.lng !== null,
          )
          .map((s) => (
            <Marker
              key={s.id}
              position={{ lat: s.lat, lng: s.lng }}
              title={s.name}
              onClick={() => onSelect?.(s.id)}
            />
          ))}
      </Map>
    </APIProvider>
  );
}
