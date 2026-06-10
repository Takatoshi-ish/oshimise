'use client';
import { useState } from 'react';

export function HelpBanner() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-coral-600 hover:bg-coral-50 px-3 py-1.5 rounded-full border border-cream-200 bg-white transition-colors"
      >
        <span aria-hidden>ℹ️</span>
        使い方
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-coral-100 bg-coral-50 p-4 text-sm space-y-3 shadow-soft">
      <div className="flex justify-between items-start gap-2">
        <p className="font-bold text-coral-700">使い方</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="閉じる"
          className="text-ink-400 hover:text-ink-600 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
      <ul className="space-y-2 text-ink-600">
        <li className="flex gap-2.5">
          <span className="mt-0.5" aria-hidden>➕</span>
          <span>
            <strong className="text-ink-900">お店を投稿</strong>:
            <span className="md:hidden"> 右下の「＋投稿」ボタン</span>
            <span className="hidden md:inline"> 右上の「＋お店を投稿」ボタン</span>
            から、店名を選んで「なぜ良いか」を一言
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-0.5" aria-hidden>🔍</span>
          <span>
            <strong className="text-ink-900">探す</strong>: 都道府県・ジャンル・キーワードで絞り込み。並び替えも可能
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-0.5" aria-hidden>📍</span>
          <span>
            <strong className="text-ink-900">店をタップ</strong>すると詳細&みんなの共有が見えます
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-0.5" aria-hidden>💬</span>
          <span>
            同じ店をもう一度投稿すると、あなたの共有が積み上がります
            (同じ店なら自動でまとめます)
          </span>
        </li>
      </ul>
    </div>
  );
}
