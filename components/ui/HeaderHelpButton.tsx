'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Inline pill highlighting a button or input label as it appears in the UI.
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream-100 border border-cream-200 text-ink-900 text-xs font-semibold align-baseline">
      {children}
    </span>
  );
}

// Definition-list row used in the 「探す」 section.
function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-3.5">
      <dt className="text-sm font-bold text-ink-900">{label}</dt>
      <dd className="mt-1 text-ink-700">{children}</dd>
    </div>
  );
}

// Sort-option chip with optional "デフォルト" annotation.
function SortRow({
  children,
  defaultBadge,
}: {
  children: React.ReactNode;
  defaultBadge?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sea-50 text-sea-700 text-xs font-semibold">
        {children}
      </span>
      {defaultBadge && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-coral-500 text-white text-[10px] font-bold tracking-wide">
          デフォルト
        </span>
      )}
    </div>
  );
}

// Coral-dot bullet row used in non-numbered lists.
function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span
        className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-coral-500"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

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
        <div className="px-5 py-5 overflow-y-auto text-sm text-ink-700 leading-relaxed space-y-6">
          <p className="rounded-2xl bg-coral-50 border border-coral-100 px-4 py-3 text-ink-700">
            オシミセは、書籍買い周りの道中で見つけた書店・カフェ・雑貨などの推し店を、マイキークラブ内のメンバーで集めるアプリです。
          </p>

          <section>
            <h3 className="flex items-center gap-2.5 text-base font-bold text-ink-900 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-coral-100 text-coral-700 text-sm">
                📝
              </span>
              お店を投稿する
            </h3>
            <ol className="space-y-2.5">
              {[
                <>
                  <Chip>
                    <span className="md:hidden">＋投稿</span>
                    <span className="hidden md:inline">＋お店を投稿</span>
                  </Chip>{' '}
                  ボタンを押します。
                </>,
                <>店名を入力すると候補が出ます。選ぶと地図と店舗情報が自動で表示されます。</>,
                <>必要なら、地図のピンをドラッグして位置を補正します。</>,
                <>
                  <Chip>価格帯</Chip>(任意)・<Chip>チーム</Chip>・<Chip>投稿者</Chip>を選びます。
                </>,
                <>
                  <Chip>みんなに共有</Chip>になぜ良いかを一文で書きます。料理名や食材を含めると、後で検索したときヒットしやすくなります。
                </>,
                <>
                  写真を添付(任意・最大5枚)して<Chip>投稿する</Chip>。
                </>,
              ].map((node, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-coral-50 text-coral-700 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{node}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 ml-9 text-xs text-ink-500 bg-cream-100 rounded-xl px-3 py-2">
              ヒント: 入力の途中で戻ったり閉じても、タブが残っていれば下書きは自動保存されています。
            </p>
          </section>

          <section className="pt-2 border-t border-cream-200">
            <h3 className="flex items-center gap-2.5 text-base font-bold text-ink-900 mt-5 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sea-100 text-sea-700 text-sm">
                🔍
              </span>
              推し店を探す
            </h3>
            <dl className="space-y-3">
              <ControlRow label="検索バー">
                店名やキーワードで横断検索します。みんなの共有本文も対象です。
              </ControlRow>
              <ControlRow label="フィルタボタン">
                都道府県やジャンルで絞り込みます。
              </ControlRow>
              <ControlRow label="並び替え">
                <div className="mt-1 space-y-1.5">
                  <SortRow defaultBadge>最近共有された順</SortRow>
                  <p className="text-xs text-ink-500 pl-1">直近で話題になった店から表示</p>
                  <SortRow>店の新着順</SortRow>
                  <p className="text-xs text-ink-500 pl-1">新しく登録された店から表示</p>
                  <SortRow>共有件数の多い順</SortRow>
                  <p className="text-xs text-ink-500 pl-1">みんなの推し度が高い店から表示</p>
                </div>
              </ControlRow>
              <ControlRow label="地図タブ">
                地図上のピンで場所感覚で探せます。ピンをタップするとミニカードが出て、詳細に進めます。
              </ControlRow>
            </dl>
          </section>

          <section className="pt-2 border-t border-cream-200">
            <h3 className="flex items-center gap-2.5 text-base font-bold text-ink-900 mt-5 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-coral-100 text-coral-700 text-sm">
                📍
              </span>
              詳細を見る・共有を積み上げる
            </h3>
            <ul className="space-y-2.5">
              <BulletRow>
                カードや地図のピンをタップすると、写真・住所・みんなの共有が読めます。
              </BulletRow>
              <BulletRow>
                <Chip>共有を追加</Chip>{' '}ボタンから、自分のコメントを同じ店に追加できます。
              </BulletRow>
              <BulletRow>
                同じ店をもう一度投稿しても、<strong className="text-ink-900">自動でその店にあなたの共有が追加</strong>されるだけです。重複した店舗は作られません。
              </BulletRow>
            </ul>
          </section>

          <section className="pt-2 border-t border-cream-200">
            <h3 className="flex items-center gap-2.5 text-base font-bold text-ink-900 mt-5 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sea-100 text-sea-700 text-sm">
                👥
              </span>
              チーム表示の切替
            </h3>
            <ul className="space-y-2.5">
              <BulletRow>
                ヘッダーの<Chip>表示</Chip>プルダウンで、<strong className="text-ink-900">全チーム</strong>と<strong className="text-ink-900">特定のチーム</strong>を切り替えできます。
              </BulletRow>
              <BulletRow>
                チームを選ぶと、そのチームから閲覧可能な店舗だけが表示されます。閲覧範囲は管理者が設定しています。
              </BulletRow>
              <BulletRow>
                選択は端末ごとに保存され、次回アクセス時もそのまま維持されます。
              </BulletRow>
            </ul>
          </section>

          <p className="pt-5 border-t border-cream-200 text-xs text-ink-400 text-center">
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
