import Link from 'next/link';
import { listActiveTeams } from '@/lib/repositories/teams';

export const dynamic = 'force-dynamic';

// "/" is a plain team-picker. It intentionally does NOT render the app
// itself — every team (including 佐藤チーム) now uses /t/<slug>. Once the
// visitor picks a team we replace() the history entry so their back
// button stays inside /t/<slug> rather than bouncing back here.
export default async function LandingPage() {
  const teams = await listActiveTeams();
  const withSlugs = teams.filter((t) => !!t.slug);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <section className="text-center mb-8 sm:mb-10">
        <p className="text-[11px] font-semibold tracking-widest text-coral-600 uppercase mb-2">
          Welcome
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight mb-3">
          チームを選んでください
        </h1>
        <p className="text-sm text-ink-500 leading-relaxed">
          各チームごとに専用URLがあります。
          <br />
          遷移後はそのURLをブックマークしてご利用ください。
        </p>
      </section>

      {withSlugs.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-100 p-6 text-center">
          <p className="text-sm text-ink-500">
            まだ公開されているチームがありません。
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {withSlugs.map((t) => (
            <li key={t.id}>
              <Link
                href={`/t/${t.slug}`}
                replace
                className="flex items-center justify-between gap-3 bg-white border border-cream-100 hover:border-coral-200 hover:bg-coral-50/40 rounded-2xl px-5 py-4 transition-colors group"
              >
                <p className="font-semibold text-ink-900 truncate min-w-0">
                  {t.name}
                </p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink-300 group-hover:text-coral-500 flex-shrink-0 transition-colors"
                  aria-hidden
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-ink-400 text-center mt-8 leading-relaxed">
        この画面は「オシミセ」のトップページです。
        <br />
        チームメンバーの方は、招待された各チームURLを直接ご利用ください。
      </p>
    </main>
  );
}
