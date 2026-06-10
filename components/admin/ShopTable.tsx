'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from './ConfirmDialog';

type Shop = {
  id: string;
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  gmapUrl: string | null;
  shareCount: number;
  photoCount: number;
};

function priceText(level: number | null): string {
  if (level === null || level <= 0) return '';
  return '¥'.repeat(Math.min(level, 4));
}

export function ShopTable() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Shop>>({});
  const [confirmDelete, setConfirmDelete] = useState<Shop | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/shops');
      if (r.ok) setShops(await r.json());
      else setError('読み込み失敗');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleStartEdit = (s: Shop) => {
    setEditingId(s.id);
    setEdit({
      name: s.name,
      genre: s.genre,
      pref: s.pref,
      city: s.city,
      area: s.area,
      priceLevel: s.priceLevel,
    });
  };

  const handleSave = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/shops/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: edit.name,
          genre: edit.genre || null,
          pref: edit.pref || null,
          city: edit.city || null,
          area: edit.area || null,
          priceLevel:
            typeof edit.priceLevel === 'number' ? edit.priceLevel : null,
        }),
      });
      setEditingId(null);
      setEdit({});
      await load();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/shops/${confirmDelete.id}`, { method: 'DELETE' });
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
              <th className="py-2 pr-3">店名</th>
              <th className="py-2 pr-3">ジャンル</th>
              <th className="py-2 pr-3">エリア</th>
              <th className="py-2 pr-3">価格</th>
              <th className="py-2 pr-3">共有</th>
              <th className="py-2 pr-3">写真</th>
              <th className="py-2 pr-3">地図</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => {
              const isEditing = editingId === s.id;
              return (
                <tr key={s.id} className="border-b border-neutral-100 align-top">
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={edit.name ?? ''}
                        onChange={(e) =>
                          setEdit({ ...edit, name: e.target.value })
                        }
                        className="rounded border border-neutral-300 px-2 py-1 text-sm w-40"
                      />
                    ) : (
                      <Link
                        href={`/shops/${s.id}`}
                        className="hover:underline"
                      >
                        {s.name}
                      </Link>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={edit.genre ?? ''}
                        onChange={(e) =>
                          setEdit({ ...edit, genre: e.target.value })
                        }
                        className="rounded border border-neutral-300 px-2 py-1 text-sm w-24"
                      />
                    ) : (
                      s.genre ?? '-'
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={edit.pref ?? ''}
                          onChange={(e) =>
                            setEdit({ ...edit, pref: e.target.value })
                          }
                          placeholder="都道府県"
                          className="rounded border border-neutral-300 px-2 py-1 text-sm w-24 block"
                        />
                        <input
                          type="text"
                          value={edit.city ?? ''}
                          onChange={(e) =>
                            setEdit({ ...edit, city: e.target.value })
                          }
                          placeholder="市区町村"
                          className="rounded border border-neutral-300 px-2 py-1 text-sm w-24 block"
                        />
                        <input
                          type="text"
                          value={edit.area ?? ''}
                          onChange={(e) =>
                            setEdit({ ...edit, area: e.target.value })
                          }
                          placeholder="エリア"
                          className="rounded border border-neutral-300 px-2 py-1 text-sm w-24 block"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs">{s.pref ?? ''}</div>
                        <div className="text-xs text-neutral-600">
                          {s.city ?? ''}
                          {s.area && s.area !== s.city ? ` / ${s.area}` : ''}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <select
                        value={edit.priceLevel ?? ''}
                        onChange={(e) =>
                          setEdit({
                            ...edit,
                            priceLevel: e.target.value === ''
                              ? null
                              : Number(e.target.value),
                          })
                        }
                        className="rounded border border-neutral-300 px-1 py-1 text-sm bg-white"
                      >
                        <option value="">-</option>
                        <option value="1">¥</option>
                        <option value="2">¥¥</option>
                        <option value="3">¥¥¥</option>
                        <option value="4">¥¥¥¥</option>
                      </select>
                    ) : (
                      priceText(s.priceLevel) || '-'
                    )}
                  </td>
                  <td className="py-2 pr-3">{s.shareCount}</td>
                  <td className="py-2 pr-3">{s.photoCount}</td>
                  <td className="py-2 pr-3">
                    {s.gmapUrl ? (
                      <a
                        href={s.gmapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                      >
                        📍
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 space-x-2 whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(s.id)}
                          disabled={busy || !edit.name}
                          className="text-xs underline disabled:opacity-40"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEdit({});
                          }}
                          className="text-xs underline text-neutral-500"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="text-xs underline"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => setConfirmDelete(s)}
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
          title="店舗を削除"
          message={`「${confirmDelete.name}」を削除します。\n紐づく共有・写真もすべて削除されます。この操作は取り消せません。`}
          confirmLabel={busy ? '削除中...' : '削除する'}
          destructive
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
