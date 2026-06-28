'use client';
import { useEffect, useState } from 'react';
import { saveViewerTeamId } from '@/lib/viewerTeam';

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
  const current = teams.find((t) => t.id === value);
  if (teams.length === 0) return null;
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-ink-500">
      <span className="hidden sm:inline">あなた:</span>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          saveViewerTeamId(e.target.value);
        }}
        className="rounded-full border border-cream-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
        aria-label="あなたのチーム"
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {!current && <span className="text-coral-700">(未選択)</span>}
    </label>
  );
}
