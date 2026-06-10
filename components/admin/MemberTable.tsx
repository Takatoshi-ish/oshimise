'use client';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

type Member = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

export function MemberTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/members');
      if (r.ok) setMembers(await r.json());
      else setError('読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (r.ok) {
        setNewName('');
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
        body: JSON.stringify({ name: editName.trim() }),
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
      <p className="text-sm text-neutral-500 flex items-center gap-2">
        <Spinner /> 読み込み中
      </p>
    );
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="py-2 pr-3">名前</th>
              <th className="py-2 pr-3">状態</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100">
                <td className="py-2 pr-3">
                  {editingId === m.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    m.name
                  )}
                </td>
                <td className="py-2 pr-3">
                  {m.active ? (
                    <span className="text-green-700">有効</span>
                  ) : (
                    <span className="text-neutral-400">無効</span>
                  )}
                </td>
                <td className="py-2 space-x-2 whitespace-nowrap">
                  {editingId === m.id ? (
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
                        className="text-xs underline text-neutral-500"
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
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいメンバー名"
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm flex-1 max-w-xs"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !newName.trim()}
          className="rounded bg-neutral-900 text-white px-3 py-1.5 text-sm disabled:opacity-40"
        >
          ＋ 追加
        </button>
      </div>
    </div>
  );
}
