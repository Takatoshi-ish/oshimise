'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function HeaderHelpButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close with Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const modal = open ? (
    <div
      className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 overflow-y-auto"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-cream-50 w-full md:max-w-md md:rounded-3xl rounded-t-3xl shadow-cardHover max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-cream-50/95 backdrop-blur border-b border-cream-100 px-5 py-3.5 flex justify-between items-start gap-2 rounded-t-3xl">
          <h2 className="font-bold text-ink-900 text-base">使い方</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-500 hover:text-coral-600 hover:bg-coral-50 transition-colors flex-shrink-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">
          <ul className="space-y-2.5 text-sm text-ink-700">
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex-shrink-0" aria-hidden>➕</span>
              <span>
                <strong className="text-ink-900">お店を投稿</strong>:
                <span className="md:hidden"> 右下の「＋投稿」ボタン</span>
                <span className="hidden md:inline">
                  {' '}右上の「＋お店を投稿」ボタン
                </span>
                から、店名を選んで「なぜ良いか」を一言
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex-shrink-0" aria-hidden>🔍</span>
              <span>
                <strong className="text-ink-900">探す</strong>:
                検索バーやフィルタで都道府県・ジャンル・キーワードを指定。並び替えも可能
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex-shrink-0" aria-hidden>📍</span>
              <span>
                <strong className="text-ink-900">店をタップ</strong>すると詳細&みんなの共有が見えます
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex-shrink-0" aria-hidden>💬</span>
              <span>
                同じ店をもう一度投稿すると、あなたの共有が積み上がります(同じ店なら自動でまとめます)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-coral-600 hover:bg-coral-50 px-3 py-1.5 rounded-full border border-cream-200 bg-white transition-colors"
      >
        <span aria-hidden>ℹ️</span>
        <span className="hidden sm:inline">使い方</span>
      </button>
      {/* Render outside the sticky/backdrop-blur header so the fixed overlay
          covers the full viewport instead of being clipped to the header. */}
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
