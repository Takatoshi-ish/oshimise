'use client';
import { useRef, useState } from 'react';
import { PHOTO_LIMIT_PER_POST, PHOTO_MAX_BYTES } from '@/config/data';

type UploadedPhoto = { id: string; url: string };

type Props = {
  memberId: string;
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
};

export function PhotoUploader({ memberId, photos, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!memberId) {
      setError('投稿者を先に選んでください');
      return;
    }
    if (photos.length + files.length > PHOTO_LIMIT_PER_POST) {
      setError(`写真は最大${PHOTO_LIMIT_PER_POST}枚までです`);
      return;
    }
    setUploading(true);
    setError(null);
    const newPhotos: UploadedPhoto[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > PHOTO_MAX_BYTES) {
          setError(`${file.name} は10MBを超えています`);
          continue;
        }
        const fd = new FormData();
        fd.append('file', file);
        fd.append('memberId', memberId);
        fd.append('source', 'user');
        const r = await fetch('/api/photos', { method: 'POST', body: fd });
        if (r.ok) {
          const data = (await r.json()) as UploadedPhoto;
          newPhotos.push(data);
        } else {
          setError('アップロード失敗');
        }
      }
      if (newPhotos.length > 0) onChange([...photos, ...newPhotos]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        写真 <span className="text-ink-400 font-normal">（任意・最大{PHOTO_LIMIT_PER_POST}枚）</span>
      </label>
      <div className="flex flex-wrap gap-2.5">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              className="w-20 h-20 object-cover rounded-2xl shadow-soft"
            />
            <button
              type="button"
              onClick={() => handleRemove(p.id)}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-ink-900 text-white text-xs leading-none shadow-soft"
              aria-label="削除"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < PHOTO_LIMIT_PER_POST && (
          <label className="w-20 h-20 border-2 border-dashed border-cream-200 hover:border-coral-300 hover:bg-coral-50 rounded-2xl flex items-center justify-center cursor-pointer text-2xl text-ink-400 hover:text-coral-500 transition-colors bg-white">
            +
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {uploading && (
        <p className="text-xs text-ink-500 mt-1.5">アップロード中...</p>
      )}
      {error && <p className="text-xs text-coral-700 mt-1.5">{error}</p>}
    </div>
  );
}
