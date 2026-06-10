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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-xl md:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
          <h2 className="font-bold text-sm">
            この店にはもう共有があります
          </h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="rounded border border-neutral-200 px-3 py-2 bg-neutral-50 text-sm">
            <div className="font-medium">🍴 {shop.name}</div>
            <div className="text-xs text-neutral-600 mt-0.5 flex gap-2 flex-wrap">
              {shop.genre && <span>{shop.genre}</span>}
              {priceText(shop.priceLevel) && <span>{priceText(shop.priceLevel)}</span>}
              {(shop.area || shop.city || shop.pref) && (
                <span>📍 {shop.area || shop.city || shop.pref}</span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">
              これまでの共有 ({existingRecommendations.length})
            </h3>
            <ShareList items={existingRecommendations} />
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="text-sm font-medium mb-3">あなたの共有を追加</h3>
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !memberId || !comment.trim()}
            className="w-full rounded-lg bg-neutral-900 text-white py-3 font-medium disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting && <Spinner />}
            共有を追加する
          </button>
        </div>
      </div>
    </div>
  );
}
