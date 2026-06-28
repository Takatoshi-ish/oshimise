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
            <Link href="/" className="flex items-center gap-2.5 group">
              <span
                className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center shadow-soft group-hover:shadow-cardHover transition-shadow"
                aria-hidden
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold tracking-tight text-ink-900 leading-none">
                  オシミセ
                </span>
                <span className="hidden sm:inline text-xs text-ink-400 font-medium leading-none">
                  みんなで集める推し店
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
