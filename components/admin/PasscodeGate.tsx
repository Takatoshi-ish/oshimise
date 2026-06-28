'use client';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { AppLogo } from '@/components/ui/AppLogo';

type Props = { children: React.ReactNode };

export function PasscodeGate({ children }: Props) {
  const [status, setStatus] = useState<'checking' | 'unauth' | 'authed'>(
    'checking',
  );
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => setStatus(r.ok ? 'authed' : 'unauth'))
      .catch(() => setStatus('unauth'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (r.ok) {
        setStatus('authed');
        setPasscode('');
      } else {
        setError('パスコードが違います');
      }
    } catch {
      setError('通信エラー');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="p-8 text-sm text-neutral-500 flex items-center gap-2">
        <Spinner /> 認証確認中...
      </div>
    );
  }
  if (status === 'unauth') {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <div className="flex items-center gap-2.5 mb-4">
          <AppLogo size={28} />
          <h1 className="text-lg font-extrabold tracking-tight text-ink-900">
            管理画面
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            パスコード
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-base"
              autoFocus
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !passcode}
            className="w-full rounded-lg bg-neutral-900 text-white py-2 font-medium disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting && <Spinner />}
            ログイン
          </button>
        </form>
      </div>
    );
  }
  return <>{children}</>;
}
