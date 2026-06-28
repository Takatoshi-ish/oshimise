'use client';
import { useEffect, useState } from 'react';

type Member = { id: string; name: string };

type Props = {
  value: string;
  onChange: (id: string, name?: string) => void;
  /** If provided, only members in this team are shown. */
  teamId?: string;
};

export function MemberSelect({ value, onChange, teamId }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    const url = teamId
      ? `/api/members?teamId=${encodeURIComponent(teamId)}`
      : '/api/members';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => setMembers([]));
  }, [teamId]);
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        投稿者 <span className="text-coral-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          const m = members.find((mm) => mm.id === id);
          onChange(id, m?.name);
        }}
        disabled={!teamId}
        className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 disabled:bg-cream-100 disabled:text-ink-400 disabled:cursor-not-allowed"
      >
        <option value="">
          {teamId ? '— 選択 —' : '— 先にチームを選択 —'}
        </option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
