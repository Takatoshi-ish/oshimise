import { findTeamBySlug } from '@/lib/repositories/teams';
import { JoinForm } from '@/components/join/JoinForm';

export const dynamic = 'force-dynamic';

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: slug } = await searchParams;
  const requiresPasscode = !!process.env.JOIN_PASSCODE;
  // Pre-select a team only when ?team=<slug> is present and resolves.
  // Otherwise the user picks from the full team list in JoinForm.
  const team = slug && slug.length > 0 ? await findTeamBySlug(slug) : null;
  return (
    <JoinForm
      requiresPasscode={requiresPasscode}
      defaultTeamId={team && team.active ? team.id : null}
    />
  );
}
