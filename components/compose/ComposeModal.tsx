'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceSearch, type PlaceSuggestion } from './PlaceSearch';
import { MapPreview } from './MapPreview';
import { PriceSelector } from './PriceSelector';
import { MemberSelect } from './MemberSelect';
import { ShareInput } from './ShareInput';
import { PhotoUploader } from './PhotoUploader';
import { MergeView } from './MergeView';
import { Spinner } from '@/components/ui/Spinner';
import type { Recommendation } from '@/components/shop/ShareList';
import {
  loadDraft,
  saveDraft,
  clearDraft,
  loadLastMember,
  saveLastMember,
  type DraftPayload,
  type DraftPlace,
} from '@/lib/draft';

type MergeShop = {
  id: string;
  name: string;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  genre: string | null;
};

type PlaceDetails = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  types: string[];
  priceLevel: number | null;
  pref: string | null;
  city: string | null;
  genreSuggestion: string;
  gmapUrl: string | null;
  photoRef: string | null;
};

function toDraftPlace(p: PlaceDetails): DraftPlace {
  return {
    placeId: p.placeId,
    name: p.name,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    pref: p.pref,
    city: p.city,
    gmapUrl: p.gmapUrl,
    genreSuggestion: p.genreSuggestion,
  };
}

export function ComposeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [sessionToken] = useState(() => crypto.randomUUID());
  const [place, setPlace] = useState<DraftPlace | null>(null);
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [area, setArea] = useState('');
  const [genre, setGenre] = useState('');
  const [memberId, setMemberId] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mergeShop, setMergeShop] = useState<MergeShop | null>(null);
  const [mergeRecs, setMergeRecs] = useState<Recommendation[]>([]);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setPlace(draft.place);
      setPinLat(draft.pinLat);
      setPinLng(draft.pinLng);
      setComment(draft.comment);
      setPriceLevel(draft.priceLevel);
      setArea(draft.area);
      setGenre(draft.genre);
      setMemberId(draft.memberId);
      setPhotos(draft.photos);
      setRestored(true);
    } else {
      const last = loadLastMember();
      if (last) setMemberId(last);
    }
    setHydrated(true);
  }, []);

  // Persist draft on changes (skip the initial hydration cycle)
  useEffect(() => {
    if (!hydrated) return;
    const hasContent =
      !!place || comment.length > 0 || photos.length > 0 || memberId.length > 0;
    if (!hasContent) return;
    const payload: DraftPayload = {
      place,
      pinLat,
      pinLng,
      comment,
      priceLevel,
      area,
      genre,
      memberId,
      photos,
    };
    saveDraft(payload);
  }, [
    hydrated,
    place,
    pinLat,
    pinLng,
    comment,
    priceLevel,
    area,
    genre,
    memberId,
    photos,
  ]);

  const handleSelectPlace = async (suggestion: PlaceSuggestion) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}&sessiontoken=${encodeURIComponent(sessionToken)}`,
      );
      if (!r.ok) throw new Error('details failed');
      const d = (await r.json()) as PlaceDetails;
      setPlace(toDraftPlace(d));
      setPinLat(d.lat);
      setPinLng(d.lng);
      setGenre(d.genreSuggestion);
      setArea(d.city ?? '');
      setPriceLevel(d.priceLevel);

      // Duplicate check: if shop already exists, switch to MergeView (S-2b)
      try {
        const dup = await fetch(
          `/api/shops/by-place/${encodeURIComponent(suggestion.placeId)}`,
        );
        if (dup.ok) {
          const data = (await dup.json()) as {
            shop: MergeShop;
            recommendations: Recommendation[];
          };
          setMergeShop(data.shop);
          setMergeRecs(data.recommendations);
        }
      } catch {
        /* ignore */
      }
    } catch {
      setError('店舗詳細の取得に失敗しました');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async () => {
    if (!place || !memberId || !comment.trim()) {
      setError('店・投稿者・共有本文は必須です');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: place.placeId,
          memberId,
          comment: comment.trim(),
          priceLevel,
          genre: genre || null,
          area: area || null,
          photoIds: photos.map((p) => p.id),
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        setError(err?.error?.message ?? '投稿に失敗しました');
        return;
      }
      saveLastMember(memberId);
      clearDraft();
      onClose();
      router.refresh();
    } catch {
      setError('投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDraft = () => {
    clearDraft();
    setPlace(null);
    setPinLat(null);
    setPinLng(null);
    setComment('');
    setPriceLevel(null);
    setArea('');
    setGenre('');
    setPhotos([]);
    setRestored(false);
  };

  // Duplicate detected → switch to MergeView (S-2b)
  if (mergeShop) {
    return (
      <MergeView
        shop={mergeShop}
        existingRecommendations={mergeRecs}
        onClose={() => {
          clearDraft();
          onClose();
        }}
        onAdded={() => {
          clearDraft();
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center backdrop-blur-sm">
      <div className="bg-cream-50 w-full md:max-w-xl md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-cardHover">
        <div className="sticky top-0 bg-cream-50/95 backdrop-blur border-b border-cream-100 px-5 py-3.5 flex justify-between items-center">
          <h2 className="font-bold text-ink-900">お店を投稿</h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-2xl leading-none px-2 text-ink-400 hover:text-ink-600"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {restored && (
            <div className="rounded-2xl bg-sea-50 border border-sea-100 px-3.5 py-2.5 text-xs text-sea-700 flex items-center justify-between gap-2">
              <span>前回の入力を復元しました</span>
              <button
                type="button"
                onClick={handleResetDraft}
                className="underline whitespace-nowrap font-medium"
              >
                最初からやり直す
              </button>
            </div>
          )}

          <PlaceSearch
            sessionToken={sessionToken}
            onSelect={handleSelectPlace}
          />
          {loadingDetails && (
            <div className="text-sm text-ink-500 flex items-center gap-2">
              <Spinner /> 詳細を取得中...
            </div>
          )}

          {place && pinLat !== null && pinLng !== null && (
            <>
              <div className="rounded-2xl bg-white shadow-soft border border-cream-100 px-4 py-3 text-sm">
                <div className="font-semibold text-ink-900">{place.name}</div>
                {place.address && (
                  <div className="text-xs text-ink-500 mt-0.5">
                    {place.address}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap mt-1.5 text-xs">
                  {place.pref && (
                    <span className="text-ink-500">
                      📍 {place.pref}
                      {place.city ? ` / ${place.city}` : ''}
                    </span>
                  )}
                  {place.genreSuggestion && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-coral-50 text-coral-700 font-medium">
                      🍴 {place.genreSuggestion}
                    </span>
                  )}
                </div>
              </div>
              <MapPreview
                lat={pinLat}
                lng={pinLng}
                onChange={({ lat, lng }) => {
                  setPinLat(lat);
                  setPinLng(lng);
                }}
              />
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                  ジャンル
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                  エリア/沿線
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
                />
              </div>
              <PriceSelector value={priceLevel} onChange={setPriceLevel} />
              <MemberSelect value={memberId} onChange={setMemberId} />
              <ShareInput value={comment} onChange={setComment} />
              <PhotoUploader
                memberId={memberId}
                photos={photos}
                onChange={setPhotos}
              />
            </>
          )}

          {error && <p className="text-sm text-coral-700">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting || !place || !memberId || !comment.trim()
            }
            className="w-full rounded-full bg-coral-500 hover:bg-coral-600 text-white py-3.5 font-semibold disabled:opacity-40 disabled:hover:bg-coral-500 flex items-center justify-center gap-2 shadow-soft transition-colors"
          >
            {submitting && <Spinner />}
            投稿する
          </button>
        </div>
      </div>
    </div>
  );
}
