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
      <body className="min-h-screen bg-cream-50 text-ink-600 antialiased">
        <header className="bg-white border-b border-cream-100">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-baseline gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink">
              オシミセ
            </h1>
            <span className="hidden sm:inline text-xs text-coral-600 font-medium">
              みんなで集める推し店リスト
            </span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
