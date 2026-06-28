'use client';
import { useEffect, useState } from 'react';
import { saveViewerTeamId } from '@/lib/viewerTeam';

type Team = { id: string; name: string };

type Props = {
  /** Called once a team has been picked (initial onboarding). */
  onPick: (id: string) => void;
};

export function ViewerTeamPicker({ onPick }: Props) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [picked, setPicked] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/teams')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTeams(Array.isArray(d) ? d : []))
      .catch(() => setTeams([]));
  }, []);

  const handleSubmit = () => {
    if (!picked) return;
    setSubmitting(true);
    saveViewerTeamId(picked);
    onPick(picked);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="bg-cream-50 w-full md:max-w-sm md:rounded-3xl rounded-t-3xl p-6 space-y-4 shadow-cardHover">
        <div>
          <h2 className="text-lg font-bold text-ink-900">ようこそ!</h2>
          <p className="text-sm text-ink-500 mt-1">
            あなたのチームを選んでください
            <br />
            (後でいつでもヘッダーから変更できます)
          </p>
        </div>
        {teams === null ? (
          <p className="text-sm text-ink-400">読み込み中…</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-coral-700">チームが登録されていません。管理者に連絡してください。</p>
        ) : (
          <>
            <select
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
              className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
            >
              <option value="">— チームを選択 —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!picked || submitting}
              className="w-full rounded-full bg-coral-500 hover:bg-coral-600 text-white py-3 font-semibold disabled:opacity-40 disabled:hover:bg-coral-500 transition-colors"
            >
              はじめる
            </button>
          </>
        )}
      </div>
    </div>
  );
}
