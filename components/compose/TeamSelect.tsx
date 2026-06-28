'use client';
import { useEffect, useState } from 'react';

type Team = { id: string; name: string };

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function TeamSelect({ value, onChange }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    fetch('/api/teams')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setTeams(d))
      .catch(() => {});
  }, []);
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        チーム <span className="text-coral-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
