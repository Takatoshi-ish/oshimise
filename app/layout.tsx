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
        <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-md border-b border-cream-100">
          <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span
                className="w-9 h-9 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center text-white text-lg shadow-soft group-hover:shadow-cardHover transition-shadow"
                aria-hidden
              >
                🍽️
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-ink-900">
                  オシミセ
                </span>
                <span className="hidden sm:inline text-[11px] text-ink-400 font-medium mt-0.5">
                  みんなで集める推し店リスト
                </span>
              </span>
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
