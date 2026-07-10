'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { saveViewerTeamId } from '@/lib/viewerTeam';
import { saveLastTeam } from '@/lib/draft';

type Team = { id: string; name: string; slug: string | null };

type Props = {
  requiresPasscode: boolean;
  /** From /join?team=<slug>. Selects that team by default but the user
   *  can change it via the dropdown before submitting. */
  defaultTeamId: string | null;
};

type Done = {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  teamSlug: string | null;
};

function DoneScreen({
  done,
  appPath,
  fullAppUrl,
}: {
  done: Done;
  appPath: string;
  fullAppUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullAppUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto pt-8 pb-16">
      <div className="rounded-3xl bg-white shadow-card p-6 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-4xl" aria-hidden>🎉</p>
          <h1 className="text-xl font-extrabold text-ink-900">
            登録できました!
          </h1>
          <div className="text-sm text-ink-600 space-y-0.5">
            <p>
              <strong className="text-ink-900">{done.name}</strong> さん
            </p>
            <p>
              所属チーム: <strong>{done.teamName}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-coral-100 bg-coral-50 p-4 space-y-2.5">
          <p className="text-xs font-bold text-coral-700 tracking-wide uppercase">
            {done.teamName} 専用のオシミセURL
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={fullAppUrl}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-700 truncate"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="rounded-full bg-coral-500 hover:bg-coral-600 text-white px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {copied ? 'コピー済' : 'コピー'}
            </button>
          </div>
          <p className="text-xs text-ink-700 leading-relaxed">
            このURLは <strong>{done.teamName}</strong> 専用です。次回アクセスできるように、以下のどれかで保存しておくことをおすすめします:
          </p>
          <ul className="text-xs text-ink-600 space-y-1.5 pl-5 list-disc">
            <li>
              <strong className="text-ink-900">スマホ</strong>:
              ブラウザで開いたまま <strong>タブを閉じずに残す</strong>、または「ホーム画面に追加」でアプリのように起動
            </li>
            <li>
              <strong className="text-ink-900">PC</strong>:
              <strong>お気に入り(ブックマーク)</strong>に登録
            </li>
            <li>
              自分宛てにメール/メモアプリに<strong>URLをコピペ</strong>して保存
            </li>
          </ul>
        </div>

        <Link
          href={appPath}
          className="block text-center rounded-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 text-sm font-semibold transition-colors"
        >
          オシミセを使ってみる →
        </Link>
      </div>
    </main>
  );
}

export function JoinForm({ requiresPasscode, defaultTeamId }: Props) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState(defaultTeamId ?? '');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    fetch('/api/teams')
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Team[]) => {
        if (!Array.isArray(d)) {
          setTeams([]);
          return;
        }
        setTeams(d);
        // If the URL-provided default is unknown (e.g. deleted team),
        // fall back to nothing selected.
        if (defaultTeamId && !d.some((t) => t.id === defaultTeamId)) {
          setTeamId('');
        }
      })
      .catch(() => setTeams([]));
  }, [defaultTeamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          teamId,
          passcode: passcode || undefined,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        const code = err?.error?.code;
        setError(
          code === 'UNAUTHORIZED'
            ? '合言葉が違います'
            : err?.error?.message ?? '登録に失敗しました',
        );
        return;
      }
      const data = (await r.json()) as Done;
      saveViewerTeamId(data.teamId);
      saveLastTeam(data.teamId);
      setDone(data);
    } catch {
      setError('通信エラー');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    // After success, send the user to their team's dedicated URL if the
    // team has a slug; otherwise fall back to "/".
    const appPath = done.teamSlug ? `/t/${done.teamSlug}` : '/';
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const fullAppUrl = origin ? `${origin}${appPath}` : appPath;
    return <DoneScreen done={done} appPath={appPath} fullAppUrl={fullAppUrl} />;
  }

  return (
    <main className="p-4 max-w-md mx-auto pt-8 pb-24">
      <div className="rounded-3xl bg-white shadow-card p-6 space-y-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
            メンバー登録
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            お名前と所属チームを選ぶだけで完了します
          </p>
        </div>

        {teams === null ? (
          <p className="text-sm text-ink-400 flex items-center gap-2">
            <Spinner /> 読み込み中…
          </p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-coral-700">
            チームが登録されていません。管理者に連絡してください。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                お名前 <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 山田太郎"
                required
                maxLength={30}
                className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                所属チーム <span className="text-coral-500">*</span>
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
                className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
              >
                <option value="">— 選択 —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {requiresPasscode && (
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                  合言葉 <span className="text-coral-500">*</span>
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
                />
                <p className="text-xs text-ink-400 mt-1">
                  招待を受けた方には別途お伝えしています
                </p>
              </div>
            )}
            {error && <p className="text-sm text-coral-700">{error}</p>}
            <button
              type="submit"
              disabled={
                submitting ||
                !name.trim() ||
                !teamId ||
                (requiresPasscode && !passcode)
              }
              className="w-full rounded-full bg-coral-500 hover:bg-coral-600 text-white py-3 font-semibold disabled:opacity-40 disabled:hover:bg-coral-500 flex items-center justify-center gap-2 transition-colors"
            >
              {submitting && <Spinner />}
              登録する
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
