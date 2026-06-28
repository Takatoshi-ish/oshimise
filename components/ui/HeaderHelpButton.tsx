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
        <div className="px-5 py-5 overflow-y-auto text-sm text-ink-700 leading-relaxed">
          <p className="text-ink-600">
            オシミセは、書籍買い周りの道中で見つけた書店・カフェ・雑貨などの推し店を、マイキークラブ内のメンバーで集めるアプリです。
          </p>

          <section className="mt-6 pt-5 border-t border-cream-200">
            <h3 className="text-base font-bold text-ink-900 mb-3">
              お店を投稿する
            </h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <span className="md:hidden">右下の「＋投稿」ボタン</span>
                <span className="hidden md:inline">右上の「＋お店を投稿」ボタン</span>
                を押します。
              </li>
              <li>
                店名を入力すると候補が出るので、選ぶと地図と店舗情報が自動で表示されます。
              </li>
              <li>必要なら、地図のピンをドラッグして位置を補正します。</li>
              <li>価格帯(任意)・チーム・投稿者を選びます。</li>
              <li>
                「みんなに共有」になぜ良いかを一文で書きます。料理名や食材を含めると、後で検索したときヒットしやすくなります。
              </li>
              <li>写真を添付(任意・最大5枚)して「投稿する」。</li>
            </ol>
            <p className="mt-3 text-xs text-ink-500">
              入力の途中で戻ったり閉じても、タブが残っていれば下書きは自動保存されています。
            </p>
          </section>

          <section className="mt-6 pt-5 border-t border-cream-200">
            <h3 className="text-base font-bold text-ink-900 mb-3">
              推し店を探す
            </h3>

            <dl className="space-y-3">
              <div>
                <dt className="font-semibold text-ink-900">検索バー</dt>
                <dd className="mt-0.5 text-ink-700">
                  店名やキーワードで横断検索します。みんなの共有本文も対象です。
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">フィルタボタン</dt>
                <dd className="mt-0.5 text-ink-700">
                  都道府県やジャンルで絞り込みます。
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">並び替え</dt>
                <dd className="mt-0.5 text-ink-700 space-y-1">
                  <p>
                    <span className="font-medium text-ink-900">最近共有された順</span>
                    (デフォルト) — 直近で話題になった店。
                  </p>
                  <p>
                    <span className="font-medium text-ink-900">店の新着順</span>
                    {' '}— 新しく登録された店。
                  </p>
                  <p>
                    <span className="font-medium text-ink-900">共有件数の多い順</span>
                    {' '}— みんなの推し度が高い店。
                  </p>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">地図タブ</dt>
                <dd className="mt-0.5 text-ink-700">
                  地図上のピンで場所感覚で探せます。ピンをタップするとミニカードが出て、詳細に進めます。
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-6 pt-5 border-t border-cream-200">
            <h3 className="text-base font-bold text-ink-900 mb-3">
              詳細を見る・共有を積み上げる
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                カードや地図のピンをタップすると、写真・住所・みんなの共有が読めます。
              </li>
              <li>
                「共有を追加」ボタンから、自分のコメントを同じ店に追加できます。
              </li>
              <li>
                同じ店をもう一度投稿しても、自動でその店にあなたの共有が追加されるだけです。重複した店舗は作られません。
              </li>
            </ul>
          </section>

          <section className="mt-6 pt-5 border-t border-cream-200">
            <h3 className="text-base font-bold text-ink-900 mb-3">
              チーム表示の切替
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                ヘッダーの「表示」プルダウンで、全チーム / 特定のチーム を切り替えできます。
              </li>
              <li>
                チームを選ぶと、そのチームから閲覧可能な店舗だけが表示されます。閲覧範囲は管理者が設定しています。
              </li>
              <li>
                選択は端末ごとに保存され、次回アクセス時もそのまま維持されます。
              </li>
            </ul>
          </section>

          <p className="mt-6 pt-5 border-t border-cream-200 text-xs text-ink-400">
            困ったことや改善要望は管理者までお知らせください。
          </p>
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
