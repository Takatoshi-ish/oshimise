'use client';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

type Member = {
  id: string;
  name: string;
  active: boolean;
  teamId: string | null;
  createdAt: string;
};

type Team = { id: string; name: string };

export function MemberTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeamId, setEditTeamId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newTeamId, setNewTeamId] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [mr, tr] = await Promise.all([
        fetch('/api/admin/members'),
        fetch('/api/admin/teams'),
      ]);
      if (mr.ok) setMembers(await mr.json());
      else setError('メンバー読み込み失敗');
      if (tr.ok) setTeams(await tr.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const teamName = (id: string | null) =>
    id ? teams.find((t) => t.id === id)?.name ?? '不明' : '未所属';

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          teamId: newTeamId || null,
        }),
      });
      if (r.ok) {
        setNewName('');
        setNewTeamId('');
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          teamId: editTeamId || null,
        }),
      });
      setEditingId(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (m: Member) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/members/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !m.active }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <p className="text-sm text-ink-400 flex items-center gap-2">
        <Spinner /> 読み込み中
      </p>
    );
  if (error) return <p className="text-sm text-coral-700">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-left">
              <th className="py-2 pr-3">名前</th>
              <th className="py-2 pr-3">チーム</th>
              <th className="py-2 pr-3">状態</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isEditing = editingId === m.id;
              return (
                <tr key={m.id} className="border-b border-cream-100">
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded border border-cream-200 px-2 py-1 text-sm"
                      />
                    ) : (
                      m.name
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <select
                        value={editTeamId}
                        onChange={(e) => setEditTeamId(e.target.value)}
                        className="rounded border border-cream-200 px-2 py-1 text-sm bg-white"
                      >
                        <option value="">未所属</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-ink-600">{teamName(m.teamId)}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {m.active ? (
                      <span className="text-green-700">有効</span>
                    ) : (
                      <span className="text-ink-400">無効</span>
                    )}
                  </td>
                  <td className="py-2 space-x-2 whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSave(m.id)}
                          disabled={busy || !editName.trim()}
                          className="text-xs underline disabled:opacity-40"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs underline text-ink-500"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditName(m.name);
                            setEditTeamId(m.teamId ?? '');
                          }}
                          className="text-xs underline"
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(m)}
                          disabled={busy}
                          className="text-xs underline disabled:opacity-40"
                        >
                          {m.active ? '無効化' : '有効化'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいメンバー名"
          className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-sm w-44 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
        />
        <select
          value={newTeamId}
          onChange={(e) => setNewTeamId(e.target.value)}
          className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-sm focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
        >
          <option value="">チーム未所属</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !newName.trim()}
          className="rounded-full bg-coral-500 hover:bg-coral-600 text-white px-4 py-1.5 text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          ＋ 追加
        </button>
      </div>
    </div>
  );
}
