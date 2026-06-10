'use client';
import { useEffect, useState } from 'react';

const KEY = 'oshimise:helpDismissed';

export function HelpBanner() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(KEY) === '1';
    setOpen(!dismissed);
    setHydrated(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setOpen(false);
  };

  const expand = () => setOpen(true);

  if (!hydrated || !open) {
    return (
      <div className="text-xs">
        <button
          type="button"
          onClick={expand}
          className="text-neutral-500 underline"
        >
          ℹ️ 使い方を見る
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm space-y-2">
      <div className="flex justify-between items-start gap-2">
        <p className="font-medium text-sky-900">オシミセ の使い方</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="閉じる"
          className="text-neutral-500 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
      <ul className="space-y-1.5 text-neutral-800">
        <li className="flex gap-2">
          <span aria-hidden>➕</span>
          <span>
            <strong>お店を投稿</strong>:
            右下(モバイル)or 右上(PC)のボタンから、店名を選んで「なぜ良いか」を一言
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔍</span>
          <span>
            <strong>探す</strong>: 都道府県・ジャンル・キーワードで絞り込み。並び替えも可能
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>📍</span>
          <span>
            <strong>店をタップ</strong>すると詳細&みんなの共有が見えます
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>💬</span>
          <span>
            同じ店をもう一度投稿すると、あなたの共有が積み上がります
            (同じ店なら自動でまとめます)
          </span>
        </li>
      </ul>
    </div>
  );
}
