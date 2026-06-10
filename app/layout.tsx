import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-cream-50 text-ink-600 antialiased font-sans">
        <header className="sticky top-0 z-40 bg-cream-50/85 backdrop-blur-md border-b border-cream-100">
          <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-baseline gap-2.5 group">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-coral-500 group-hover:bg-coral-600 transition-colors"
                  aria-hidden
                />
                <span className="text-lg font-extrabold tracking-tight text-ink-900">
                  オシミセ
                </span>
              </span>
              <span className="hidden sm:inline text-xs text-ink-400 font-medium">
                みんなで集める推し店
              </span>
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
