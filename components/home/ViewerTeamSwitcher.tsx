'use client';
import { useEffect, useState } from 'react';
import { saveViewerTeamId, clearViewerTeamId } from '@/lib/viewerTeam';

type Team = { id: string; name: string };

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function ViewerTeamSwitcher({ value, onChange }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    fetch('/api/teams')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setTeams(d))
      .catch(() => {});
  }, []);
  if (teams.length === 0) return null;
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-ink-500">
      <span className="hidden sm:inline">表示:</span>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          if (v) saveViewerTeamId(v);
          else clearViewerTeamId();
        }}
        className="rounded-full border border-cream-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
        aria-label="表示するチーム"
      >
        <option value="">全チーム</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
