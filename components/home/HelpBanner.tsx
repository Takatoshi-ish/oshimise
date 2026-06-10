'use client';
import { useState } from 'react';

export function HelpBanner() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-700 hover:bg-neutral-100 px-3 py-1.5 rounded border border-neutral-300 inline-flex items-center gap-1.5"
      >
        <span aria-hidden>ℹ️</span>
        使い方
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm space-y-2">
      <div className="flex justify-between items-start gap-2">
        <p className="font-medium text-sky-900">使い方</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
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
            <span className="md:hidden"> 右下の「＋投稿」ボタン</span>
            <span className="hidden md:inline"> 右上の「＋お店を投稿」ボタン</span>
            から、店名を選んで「なぜ良いか」を一言
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
