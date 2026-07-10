'use client';
import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from './ConfirmDialog';
import { TeamVisibilityDialog } from './TeamVisibilityDialog';
import { DEFAULT_TEAM_NAME } from '@/lib/defaultTeam';

export type AdminTeam = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
  createdAt: string;
  memberCount: number;
  visibleTeamIds: string[];
};

export function TeamTable() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<AdminTeam | null>(null);
  const [visEditing, setVisEditing] = useState<AdminTeam | null>(null);
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const urlForTeam = (team: AdminTeam) => {
    if (team.name === DEFAULT_TEAM_NAME) return origin;
    return team.slug ? `${origin}/t/${team.slug}` : '';
  };
  const copyUrl = async (team: AdminTeam) => {
    const url = urlForTeam(team);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedTeamId(team.id);
      setTimeout(() => setCopiedTeamId(null), 1500);
    } catch {
      /* clipboard may be blocked; user can select the text manually */
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/teams');
      if (r.ok) setTeams(await r.json());
      else setError('読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/teams', {
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

  const handleSaveName = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/teams/${id}`, {
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

  const handleToggleActive = async (t: AdminTeam) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/teams/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !t.active }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/teams/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        setError(err?.error?.message ?? '削除失敗');
      }
      setConfirmDelete(null);
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
              <th className="py-2 pr-3">チーム名</th>
              <th className="py-2 pr-3">チーム専用URL</th>
              <th className="py-2 pr-3">メンバー数</th>
              <th className="py-2 pr-3">閲覧可能チーム</th>
              <th className="py-2 pr-3">状態</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => {
              const isEditing = editingId === t.id;
              const visNames = t.visibleTeamIds
                .map((vid) => teams.find((x) => x.id === vid)?.name)
                .filter((x): x is string => !!x);
              return (
                <tr key={t.id} className="border-b border-cream-100 align-top">
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded border border-cream-200 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium text-ink-900">{t.name}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {urlForTeam(t) ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <code className="text-xs text-ink-600 bg-cream-50 border border-cream-200 rounded px-2 py-0.5 max-w-[16rem] truncate">
                          {urlForTeam(t)}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyUrl(t)}
                          className="text-xs underline text-sea-600 hover:text-sea-700 flex-shrink-0"
                        >
                          {copiedTeamId === t.id ? 'コピー済' : 'コピー'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-400">
                        (slug未設定)
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{t.memberCount}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-500">
                        {t.name}(自)
                        {visNames.length > 0 && ` + ${visNames.join(', ')}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVisEditing(t)}
                        className="text-xs underline text-sea-600 hover:text-sea-700"
                      >
                        編集
                      </button>
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    {t.active ? (
                      <span className="text-green-700 font-medium">有効</span>
                    ) : (
                      <span className="text-ink-400">無効</span>
                    )}
                  </td>
                  <td className="py-2 space-x-2 whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveName(t.id)}
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
                            setEditingId(t.id);
                            setEditName(t.name);
                          }}
                          className="text-xs underline"
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(t)}
                          disabled={busy}
                          className="text-xs underline disabled:opacity-40"
                        >
                          {t.active ? '無効化' : '有効化'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(t)}
                          disabled={t.memberCount > 0}
                          title={t.memberCount > 0 ? 'メンバーがいるチームは削除できません' : ''}
                          className="text-xs underline text-coral-600 disabled:opacity-40"
                        >
                          削除
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

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいチーム名"
          className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-sm flex-1 max-w-xs focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !newName.trim()}
          className="rounded-full bg-coral-500 hover:bg-coral-600 text-white px-4 py-1.5 text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          ＋ 追加
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="チームを削除"
          message={`「${confirmDelete.name}」を削除します。\nこの操作は取り消せません。`}
          confirmLabel={busy ? '削除中...' : '削除する'}
          destructive
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {visEditing && (
        <TeamVisibilityDialog
          team={visEditing}
          allTeams={teams}
          onClose={() => setVisEditing(null)}
          onSaved={() => {
            setVisEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
