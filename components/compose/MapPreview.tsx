'use client';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

type Props = {
  lat: number;
  lng: number;
  onChange?: (pos: { lat: number; lng: number }) => void;
};

export function MapPreview({ lat, lng, onChange }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY;
  if (!apiKey) {
    return (
      <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
        地図表示にはブラウザキー (NEXT_PUBLIC_MAPS_BROWSER_KEY) が必要です
        <div className="mt-1 font-mono">lat: {lat.toFixed(6)} / lng: {lng.toFixed(6)}</div>
      </div>
    );
  }
  return (
    <APIProvider apiKey={apiKey}>
      <div>
        <div style={{ width: '100%', height: 220 }} className="rounded overflow-hidden">
          <Map
            defaultCenter={{ lat, lng }}
            defaultZoom={16}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            mapId="oshimise-preview"
          >
            <Marker
              position={{ lat, lng }}
              draggable
              onDragEnd={(e) => {
                if (!e.latLng || !onChange) return;
                onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }}
            />
          </Map>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          ピンを動かして補正できます
        </p>
      </div>
    </APIProvider>
  );
}
