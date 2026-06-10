'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from './ConfirmDialog';

type Rec = {
  id: string;
  shopId: string;
  shopName: string;
  memberId: string;
  memberName: string;
  comment: string;
  createdAt: string;
};

export function RecTable() {
  const [items, setItems] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Rec | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/recommendations');
      if (r.ok) setItems(await r.json());
      else setError('読み込み失敗');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleSave = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/recommendations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: editComment.trim() }),
      });
      setEditingId(null);
      setEditComment('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/recommendations/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      setConfirmDelete(null);
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
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="py-2 pr-3">店</th>
              <th className="py-2 pr-3">投稿者</th>
              <th className="py-2 pr-3">本文</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const isEditing = editingId === r.id;
              return (
                <tr key={r.id} className="border-b border-neutral-100 align-top">
                  <td className="py-2 pr-3">
                    <Link
                      href={`/shops/${r.shopId}`}
                      className="hover:underline"
                    >
                      {r.shopName}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {r.memberName}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        maxLength={200}
                        className="rounded border border-neutral-300 px-2 py-1 text-sm w-full min-w-64"
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">{r.comment}</span>
                    )}
                  </td>
                  <td className="py-2 space-x-2 whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(r.id)}
                          disabled={busy || !editComment.trim()}
                          className="text-xs underline disabled:opacity-40"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs underline text-neutral-500"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setEditComment(r.comment);
                          }}
                          className="text-xs underline"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => setConfirmDelete(r)}
                          className="text-xs underline text-red-600"
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
      {confirmDelete && (
        <ConfirmDialog
          title="共有を削除"
          message={`${confirmDelete.memberName}さんの共有を削除します。`}
          confirmLabel={busy ? '削除中...' : '削除する'}
          destructive
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
