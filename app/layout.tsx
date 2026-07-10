import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { HeaderHelpButton } from '@/components/ui/HeaderHelpButton';
import { HeaderUserBadge } from '@/components/ui/HeaderUserBadge';
import { HeaderHomeLink } from '@/components/ui/HeaderHomeLink';

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
          <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-2 sm:gap-3">
            <HeaderHomeLink />
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <HeaderHelpButton />
              <HeaderUserBadge />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
