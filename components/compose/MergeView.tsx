'use client';
import { useEffect, useState } from 'react';
import { MemberSelect } from './MemberSelect';
import { ShareInput } from './ShareInput';
import { PhotoUploader } from './PhotoUploader';
import { Spinner } from '@/components/ui/Spinner';
import { ShareList, type Recommendation } from '@/components/shop/ShareList';
import { loadLastMember, saveLastMember } from '@/lib/draft';

type ShopBrief = {
  id: string;
  name: string;
  pref: string | null;
  area: string | null;
  city: string | null;
  priceLevel: number | null;
  genre: string | null;
};

type Props = {
  shop: ShopBrief;
  existingRecommendations: Recommendation[];
  onClose: () => void;
  onAdded?: () => void;
};

function priceText(level: number | null): string {
  if (level === null || level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

export function MergeView({
  shop,
  existingRecommendations,
  onClose,
  onAdded,
}: Props) {
  const [memberId, setMemberId] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const last = loadLastMember();
    if (last) setMemberId(last);
  }, []);

  const handleSubmit = async () => {
    if (!memberId || !comment.trim()) {
      setError('投稿者・共有本文は必須です');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          memberId,
          comment: comment.trim(),
          photoIds: photos.map((p) => p.id),
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        setError(err?.error?.message ?? '追加に失敗しました');
        return;
      }
      saveLastMember(memberId);
      onAdded?.();
      onClose();
    } catch {
      setError('追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center backdrop-blur-sm">
      <div className="bg-cream-50 w-full md:max-w-xl md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-cardHover">
        <div className="sticky top-0 bg-cream-50/95 backdrop-blur border-b border-cream-100 px-5 py-3.5 flex justify-between items-center">
          <h2 className="font-bold text-sm text-ink-900">
            この店にはもう共有があります
          </h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-2xl leading-none px-2 text-ink-400 hover:text-ink-600"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="rounded-2xl bg-white shadow-soft border border-cream-100 px-4 py-3 text-sm">
            <div className="font-semibold text-ink-900">🍴 {shop.name}</div>
            <div className="text-xs text-ink-500 mt-1 flex gap-2 flex-wrap">
              {shop.genre && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-coral-50 text-coral-700 font-medium">
                  {shop.genre}
                </span>
              )}
              {priceText(shop.priceLevel) && (
                <span className="font-medium text-ink-500">{priceText(shop.priceLevel)}</span>
              )}
              {(shop.area || shop.city || shop.pref) && (
                <span>📍 {shop.area || shop.city || shop.pref}</span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-2">
              これまでの共有
              <span className="ml-1.5 text-coral-600">{existingRecommendations.length}</span>
            </h3>
            <ShareList items={existingRecommendations} />
          </div>
          <div className="border-t border-cream-200 pt-4">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">あなたの共有を追加</h3>
            <div className="space-y-4">
              <MemberSelect value={memberId} onChange={setMemberId} />
              <ShareInput value={comment} onChange={setComment} />
              <PhotoUploader
                memberId={memberId}
                photos={photos}
                onChange={setPhotos}
              />
            </div>
          </div>

          {error && <p className="text-sm text-coral-700">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !memberId || !comment.trim()}
            className="w-full rounded-full bg-coral-500 hover:bg-coral-600 text-white py-3.5 font-semibold disabled:opacity-40 disabled:hover:bg-coral-500 flex items-center justify-center gap-2 shadow-soft transition-colors"
          >
            {submitting && <Spinner />}
            共有を追加する
          </button>
        </div>
      </div>
    </div>
  );
}
