'use client';
import { useEffect, useState } from 'react';
import { PasscodeGate } from '@/components/admin/PasscodeGate';
import { MemberTable } from '@/components/admin/MemberTable';
import { ShopTable } from '@/components/admin/ShopTable';
import { RecTable } from '@/components/admin/RecTable';

type Tab = 'members' | 'shops' | 'recs';

function AdminContent() {
  const [tab, setTab] = useState<Tab>('members');
  const [sheetsUrl, setSheetsUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSheetsUrl(d?.sheetsUrl ?? null))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-3 flex-wrap gap-2">
        <h1 className="text-lg font-bold">管理画面</h1>
        <div className="flex gap-3 items-center text-sm">
          {sheetsUrl && (
            <a
              href={sheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              🔗 スプレッドシートを開く
            </a>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-neutral-500 underline"
          >
            ログアウト
          </button>
        </div>
      </header>

      <nav className="flex gap-1 mb-4 border-b border-neutral-200">
        {(
          [
            ['members', 'メンバー管理'],
            ['shops', '店舗管理'],
            ['recs', '共有管理'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-2 text-sm ${
              tab === id
                ? 'border-b-2 border-neutral-900 font-medium'
                : 'text-neutral-500'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'members' && <MemberTable />}
      {tab === 'shops' && <ShopTable />}
      {tab === 'recs' && <RecTable />}
    </main>
  );
}

export default function AdminPage() {
  return (
    <PasscodeGate>
      <AdminContent />
    </PasscodeGate>
  );
}
