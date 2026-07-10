'use client';
import { useEffect, useState } from 'react';

type Team = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
};

function buildTemplate(
  origin: string,
  teamName: string | null,
  joinUrl: string,
  appUrl: string,
): string {
  const appLabel = teamName ? `${teamName} 専用のオシミセ` : 'オシミセ';
  return `${appLabel}へようこそ!

「オシミセ」は、書籍買い周りの道中で見つけた書店・カフェ・雑貨などのお気に入りのお店を、マイキークラブ内のメンバーで集めるアプリです。

▼ 登録 (1分で完了)
${joinUrl}

お名前を入力するだけで${teamName ? teamName + 'の' : ''}メンバーとして登録できます。

▼ 使い方
${appUrl}

登録後、上記URLにアクセスしてください。
1. 右下/右上の「＋投稿」ボタンから店名を選んで、おすすめポイントを一言
2. 一覧/地図でみんなの推し店を眺める
3. 気になる店をタップ → 詳細・みんなの共有が読める

困ったら画面右上の「ℹ️ 使い方」が頼りになります。

---
※ このURLはマイキークラブ内向けです。外部への共有はお控えください。`;
}

export function InvitationCard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [template, setTemplate] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/teams')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) {
          setTeams(d);
          if (d.length > 0) setSelectedTeamId(d[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const joinUrl = selectedTeam?.slug
    ? `${origin}/join?team=${selectedTeam.slug}`
    : `${origin}/join`;
  const appUrl = selectedTeam?.slug
    ? `${origin}/t/${selectedTeam.slug}`
    : origin;

  useEffect(() => {
    setTemplate(
      buildTemplate(origin, selectedTeam?.name ?? null, joinUrl, appUrl),
    );
  }, [origin, selectedTeam?.name, joinUrl, appUrl]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked — manual copy still works */
    }
  };

  return (
    <div className="rounded-2xl border border-sea-100 bg-sea-50 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-sea-700">
          新メンバーへの招待
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          チームを選ぶと、そのチーム専用の登録・アプリURL が入った案内文を作成します
        </p>
      </div>

      {/* Team selector */}
      <div>
        <label className="text-[11px] text-ink-500 font-semibold tracking-wide uppercase">
          招待するチーム
        </label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="mt-1 w-full rounded-full border border-cream-200 bg-white px-3 py-1.5 text-sm focus:border-sea-500 focus:outline-none focus:ring-2 focus:ring-sea-100"
        >
          {teams.length === 0 && <option value="">読み込み中…</option>}
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {!t.active ? ' (無効)' : ''}
              {!t.slug ? ' — slug未設定' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* URLs */}
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
            onClick={() => copy(joinUrl, 'join')}
            className="rounded-full bg-sea-500 hover:bg-sea-600 text-white px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            {copied === 'join' ? 'コピー済' : 'コピー'}
          </button>
        </div>
      </div>
      <div>
        <label className="text-[11px] text-ink-500 font-semibold tracking-wide uppercase">
          アプリURL (登録後アクセス)
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={appUrl}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-700"
          />
          <button
            type="button"
            onClick={() => copy(appUrl, 'app')}
            className="rounded-full bg-sea-500 hover:bg-sea-600 text-white px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            {copied === 'app' ? 'コピー済' : 'コピー'}
          </button>
        </div>
      </div>

      {/* Template */}
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
