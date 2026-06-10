import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'オシミセ',
  description: '推し店。みんなの推しのお店を集める集合知アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-neutral-900">
        <header className="border-b border-neutral-200 px-4 py-3 flex items-baseline gap-2">
          <h1 className="text-lg font-bold">オシミセ</h1>
          <span className="text-xs text-neutral-500">
            — みんなで集める推し店リスト
          </span>
        </header>
        {children}
      </body>
    </html>
  );
}
