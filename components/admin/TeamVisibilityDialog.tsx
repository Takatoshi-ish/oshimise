'use client';
import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminTeam } from './TeamTable';

type Props = {
  team: AdminTeam;
  allTeams: AdminTeam[];
  onClose: () => void;
  onSaved: () => void;
};

export function TeamVisibilityDialog({
  team,
  allTeams,
  onClose,
  onSaved,
}: Props) {
  const [picked, setPicked] = useState<Set<string>>(
    new Set(team.visibleTeamIds),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const others = allTeams.filter((t) => t.id !== team.id);

  const toggle = (id: string) => {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibleTeamIds: Array.from(picked) }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        setError(err?.error?.message ?? '保存失敗');
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="bg-cream-50 w-full md:max-w-md md:rounded-3xl rounded-t-3xl p-5 space-y-4 shadow-cardHover">
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            {team.name} の閲覧範囲
          </h2>
          <p className="text-xs text-ink-500 mt-1">
            このチームが「投稿を見れる」他チームを選んでください
            (自チームは常に閲覧可)
          </p>
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white opacity-60 cursor-not-allowed">
            <input type="checkbox" checked disabled className="accent-coral-500" />
            <span className="text-sm font-medium text-ink-900">{team.name}</span>
            <span className="text-xs text-ink-400">(自チーム、常に閲覧可)</span>
          </label>
          {others.length === 0 ? (
            <p className="text-sm text-ink-400 px-3 py-2">他のチームがありません</p>
          ) : (
            others.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-coral-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={picked.has(t.id)}
                  onChange={() => toggle(t.id)}
                  className="accent-coral-500"
                />
                <span className="text-sm text-ink-900">{t.name}</span>
                {!t.active && (
                  <span className="text-xs text-ink-400">(無効)</span>
                )}
              </label>
            ))
          )}
        </div>
        {error && <p className="text-sm text-coral-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-full border border-cream-200 bg-white text-ink-600 hover:bg-cream-100"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="px-5 py-2 text-sm rounded-full bg-coral-500 hover:bg-coral-600 text-white font-semibold disabled:opacity-40 inline-flex items-center gap-2"
          >
            {submitting && <Spinner size={14} />}
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
