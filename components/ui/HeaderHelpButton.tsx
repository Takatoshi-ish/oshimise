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
        <div className="px-5 py-4 overflow-y-auto space-y-5 text-sm text-ink-700">
          <p className="text-ink-600">
            オシミセは、書籍買い周りの道中で見つけた書店・カフェ・雑貨などの「推し店」をマイキークラブ内のメンバーで集めるアプリです。
          </p>

          {/* Section: 投稿 */}
          <section>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              ➕ お店を投稿する
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-ink-700">
              <li>
                <span className="md:hidden">右下の「＋投稿」ボタン</span>
                <span className="hidden md:inline">右上の「＋お店を投稿」ボタン</span>
                を押す
              </li>
              <li>店名を入力 → 候補から選ぶと地図と店舗情報が自動表示</li>
              <li>必要なら地図のピンをドラッグして位置を補正</li>
              <li>価格帯(任意)・チーム・投稿者を選択</li>
              <li>
                <strong>みんなに共有</strong>:
                「なぜ良いか / 誰におすすめか」を一文で。料理名・食材を入れると後で検索ヒットしやすい
              </li>
              <li>写真添付(任意・最大5枚) → 「投稿する」</li>
            </ol>
            <p className="mt-2 text-xs text-ink-500">
              💡 入力途中で戻ったり閉じても、タブが残っていれば下書きは自動保存されます
            </p>
          </section>

          {/* Section: 探す */}
          <section>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              🔍 推し店を探す
            </h3>
            <ul className="space-y-1.5 text-ink-700 list-disc pl-5">
              <li>
                <strong>検索バー</strong>: 店名・キーワードで横断検索
                (みんなの共有本文もヒット)
              </li>
              <li>
                <strong>🎚 フィルタ</strong>ボタン:
                都道府県・ジャンルで絞り込み
              </li>
              <li>
                <strong>並び替え</strong>:
                <span className="block ml-3 mt-0.5 text-xs text-ink-500">
                  ・最近共有された順 (デフォルト): 直近で話題になった店
                  <br />
                  ・店の新着順: 新しく登録された店
                  <br />
                  ・共有件数の多い順: みんなの推し度が高い店
                </span>
              </li>
              <li>
                <strong>🗺️ 地図タブ</strong>: 地図上のピンで場所感覚で探せる。
                ピンタップでミニカード → 詳細へ
              </li>
            </ul>
          </section>

          {/* Section: 詳細とマージ */}
          <section>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              📍 詳細を見る & 共有を積み上げる
            </h3>
            <ul className="space-y-1.5 text-ink-700 list-disc pl-5">
              <li>カードや地図のピンをタップ → 写真・住所・みんなの共有が読める</li>
              <li>
                <strong>+共有を追加</strong> ボタンで自分のコメントも積める
              </li>
              <li>
                同じ店をもう一度投稿しても、
                <strong>自動でその店にあなたの共有が追加</strong>
                されるだけ。重複店舗は作られません
              </li>
            </ul>
          </section>

          {/* Section: チーム表示 */}
          <section>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              👥 チーム表示の切替
            </h3>
            <ul className="space-y-1.5 text-ink-700 list-disc pl-5">
              <li>
                ヘッダー (PCは中央) の <strong>「表示」プルダウン</strong>{' '}
                で「全チーム / 特定チーム」を切替
              </li>
              <li>
                チームを選ぶと、そのチームから閲覧可能な店舗だけが表示されます
                (閲覧範囲は管理者が設定)
              </li>
              <li>選択は端末に保存され次回アクセス時も維持されます</li>
            </ul>
          </section>

          {/* Section: ヘッダーのバッジ */}
          <section>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              🟢 ヘッダー右上の名前
            </h3>
            <p className="text-ink-700">
              前回投稿時に選んだ投稿者名が表示されます。次回投稿時もデフォルト値として使われます (端末ごと)。
            </p>
          </section>

          <p className="text-xs text-ink-400 pt-2 border-t border-cream-200">
            困ったことや改善要望は管理者まで。
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
