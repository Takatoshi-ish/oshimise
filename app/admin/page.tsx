'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PasscodeGate } from '@/components/admin/PasscodeGate';
import { MemberTable } from '@/components/admin/MemberTable';
import { ShopTable } from '@/components/admin/ShopTable';
import { RecTable } from '@/components/admin/RecTable';
import { TeamTable } from '@/components/admin/TeamTable';
import { InvitationCard } from '@/components/admin/InvitationCard';
import { AppLogo } from '@/components/ui/AppLogo';

type Tab = 'teams' | 'invite' | 'members' | 'shops' | 'recs';

function AdminContent() {
  const [tab, setTab] = useState<Tab>('teams');
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
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-coral-600 px-3 py-1.5 rounded-full bg-white border border-cream-100 hover:border-coral-200 hover:bg-coral-50 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          ホームに戻る
        </Link>
      </div>
      <header className="flex justify-between items-center mb-4 border-b border-cream-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <AppLogo size={28} />
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
            管理画面
          </h1>
        </div>
        <div className="flex gap-3 items-center text-sm">
          {sheetsUrl && (
            <a
              href={sheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sea-600 hover:text-sea-700 font-medium"
            >
              🔗 スプレッドシートを開く
            </a>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-ink-400 hover:text-coral-600 underline transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <nav className="flex gap-1 mb-4 border-b border-neutral-200">
        {(
          [
            ['teams', 'チーム管理'],
            ['invite', '招待'],
            ['members', 'メンバー管理'],
            ['shops', '店舗管理'],
            ['recs', '投稿管理'],
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

      {/* Keep all tables mounted and toggle via display so each tab's
          internal state (scroll, in-progress edits, fetched data) survives
          when switching back. */}
      <div className={tab === 'teams' ? '' : 'hidden'}>
        <TeamTable />
      </div>
      <div className={tab === 'invite' ? '' : 'hidden'}>
        <InvitationCard />
      </div>
      <div className={tab === 'members' ? '' : 'hidden'}>
        <MemberTable />
      </div>
      <div className={tab === 'shops' ? '' : 'hidden'}>
        <ShopTable />
      </div>
      <div className={tab === 'recs' ? '' : 'hidden'}>
        <RecTable />
      </div>
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
