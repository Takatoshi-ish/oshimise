'use client';
import { useEffect, useState } from 'react';

function buildTemplate(joinUrl: string, appUrl: string): string {
  return `オシミセへようこそ!

「オシミセ」は、書籍買い周りの道中で見つけた書店・カフェ・雑貨などのお気に入りのお店を、メンバーで集めるアプリです。

▼ 登録 (1分で完了)
${joinUrl}

お名前と所属チームを選ぶだけで登録できます。

▼ 使い方
${appUrl}

登録後、上記URLにアクセスしてください。
1. 右下/右上の「＋投稿」ボタンから店名を選んで、おすすめポイントを一言
2. 一覧/地図でみんなの推し店を眺める
3. 気になる店をタップ → 詳細・みんなの共有が読める

困ったら画面左上の「ℹ️ 使い方」が頼りになります。

---
※ このURLは社内向けです。チーム外への共有はお控えください。`;
}

export function InvitationCard() {
  const [appUrl, setAppUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [template, setTemplate] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const join = `${origin}/join`;
    setAppUrl(origin);
    setJoinUrl(join);
    setTemplate(buildTemplate(join, origin));
  }, []);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard API may be blocked (insecure context etc.) — let user copy manually
    }
  };

  return (
    <div className="rounded-2xl border border-sea-100 bg-sea-50 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-sea-700">
          新メンバーへの招待
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          下記のURL or 案内文をそのままコピーして、新メンバーに送ってください
        </p>
      </div>

      {/* URL one-liner */}
      <div>
        <label className="text-[11px] text-ink-500 font-semibold tracking-wide uppercase">
          登録URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={joinUrl}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-700"
          />
          <button
            type="button"
            onClick={() => copy(joinUrl, 'url')}
            className="rounded-full bg-sea-500 hover:bg-sea-600 text-white px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            {copied === 'url' ? 'コピー済' : 'コピー'}
          </button>
        </div>
      </div>

      {/* Full template */}
      <div>
        <label className="text-[11px] text-ink-500 font-semibold tracking-wide uppercase">
          案内文 (編集してから送ってOK)
        </label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={12}
          className="mt-1 w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-xs font-mono text-ink-700 leading-relaxed focus:border-sea-500 focus:outline-none focus:ring-2 focus:ring-sea-100"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => copy(template, 'template')}
            className="rounded-full bg-sea-500 hover:bg-sea-600 text-white px-4 py-1.5 text-xs font-semibold transition-colors"
          >
            {copied === 'template' ? '✓ コピー済み' : '案内文をコピー'}
          </button>
        </div>
      </div>
    </div>
  );
}
