'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { saveViewerTeamId } from '@/lib/viewerTeam';
import { saveLastTeam } from '@/lib/draft';

type Team = { id: string; name: string };

type Props = {
  requiresPasscode: boolean;
  /** When /join?team=<slug> resolves to a real team, the team dropdown
   *  is hidden and this id is submitted. */
  lockedTeamId: string | null;
  lockedTeamName: string | null;
  /** Where the "オシミセを使ってみる" button should link after success. */
  appUrlAfterJoin: string;
};

type Done = { id: string; name: string; teamId: string; teamName: string };

export function JoinForm({
  requiresPasscode,
  lockedTeamId,
  lockedTeamName,
  appUrlAfterJoin,
}: Props) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState(lockedTeamId ?? '');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    if (lockedTeamId) {
      // Team is fixed by URL. Skip fetching the full list.
      setTeams([{ id: lockedTeamId, name: lockedTeamName ?? '' }]);
      return;
    }
    fetch('/api/teams')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTeams(Array.isArray(d) ? d : []))
      .catch(() => setTeams([]));
  }, [lockedTeamId, lockedTeamName]);

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
    return (
      <main className="p-4 max-w-md mx-auto pt-10">
        <div className="rounded-3xl bg-white shadow-card p-6 text-center space-y-4">
          <p className="text-4xl" aria-hidden>🎉</p>
          <h1 className="text-xl font-extrabold text-ink-900">
            登録できました!
          </h1>
          <div className="text-sm text-ink-600 space-y-1">
            <p>
              <strong className="text-ink-900">{done.name}</strong> さん
            </p>
            <p>
              所属チーム: <strong>{done.teamName}</strong>
            </p>
          </div>
          <Link
            href={appUrlAfterJoin}
            className="inline-block rounded-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 text-sm font-semibold transition-colors"
          >
            オシミセを使ってみる →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-md mx-auto pt-8 pb-24">
      <div className="rounded-3xl bg-white shadow-card p-6 space-y-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
            メンバー登録
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {lockedTeamName
              ? `${lockedTeamName} のメンバーとして登録します`
              : 'お名前と所属チームを選ぶだけで完了します'}
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
            {lockedTeamId ? (
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1.5">
                  所属チーム
                </label>
                <div className="rounded-2xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-base text-ink-900 font-medium">
                  {lockedTeamName}
                </div>
              </div>
            ) : (
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
            )}
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
