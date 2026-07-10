'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppLogo } from '@/components/ui/AppLogo';

// The logo/home link's target depends on where we are. On any team-scoped
// route (/t/<slug>/...) it should return to /t/<slug>, NOT to the site's
// default team page. Otherwise it links to "/".
export function HeaderHomeLink() {
  const pathname = usePathname() ?? '/';
  const teamMatch = pathname.match(/^\/t\/([^/]+)/);
  const href = teamMatch ? `/t/${teamMatch[1]}` : '/';
  return (
    <Link
      href={href}
      className="flex items-center gap-2 sm:gap-2.5 group min-w-0"
    >
      <AppLogo size={28} />
      <span className="flex items-baseline gap-2 min-w-0">
        <span className="text-lg font-extrabold tracking-tight text-ink-900 leading-none">
          オシミセ
        </span>
        <span className="hidden lg:inline text-xs text-ink-400 font-medium leading-none truncate">
          みんなで集める推し店
        </span>
      </span>
    </Link>
  );
}
