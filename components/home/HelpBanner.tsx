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

  // SSR: render closed shell to avoid hydration mismatch
  if (!hydrated || !open) {
    return (
      <div className="text-xs">
        <button
          type="button"
          onClick={expand}
          className="text-neutral-500 underline"
        >
          ℹ️ 使い方
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm space-y-2">
      <div className="flex justify-between items-start gap-2">
        <p className="font-medium">オシミセ の使い方</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="閉じる"
          className="text-neutral-500 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
      <ol className="list-decimal pl-5 space-y-1 text-neutral-800">
        <li>
          <strong>＋投稿</strong> ボタンから、メンバーが見つけたオススメ店を登録
          (店名を選ぶだけ、なぜ良いかコメントを添える)
        </li>
        <li>
          <strong>探す</strong>: 都道府県・ジャンル・キーワードで絞り込み、並び替えも可
        </li>
        <li>
          <strong>店をタップ</strong>すると詳細・みんなの共有が見えます
        </li>
        <li>
          同じ店をもう一度投稿すると、自分の共有が積み増しされます (重複は自動でまとめます)
        </li>
      </ol>
    </div>
  );
}
