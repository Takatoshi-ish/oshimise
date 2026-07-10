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
  // If admins share /join?team=<slug>, resolve it server-side so the form
  // starts with that team pre-selected. User can still change the choice.
  const defaultTeam =
    slug && slug.length > 0 ? await findTeamBySlug(slug) : null;
  return (
    <JoinForm
      requiresPasscode={requiresPasscode}
      defaultTeamId={defaultTeam && defaultTeam.active ? defaultTeam.id : null}
    />
  );
}
