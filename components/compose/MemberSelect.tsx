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
      <label className="block text-sm font-medium mb-1">投稿者 *</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-neutral-300 px-3 py-2 text-base bg-white"
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
