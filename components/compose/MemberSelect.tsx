'use client';
import { useEffect, useState } from 'react';

type Member = { id: string; name: string };

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function MemberSelect({ value, onChange }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => setMembers([]));
  }, []);
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        投稿者 <span className="text-coral-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-base focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
      >
        <option value="">— 選択 —</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
