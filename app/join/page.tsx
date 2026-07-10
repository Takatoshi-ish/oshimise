import { findTeamBySlug, findTeamByName } from '@/lib/repositories/teams';
import { JoinForm } from '@/components/join/JoinForm';
import { DEFAULT_TEAM_NAME } from '@/lib/defaultTeam';

export const dynamic = 'force-dynamic';

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: slug } = await searchParams;
  const requiresPasscode = !!process.env.JOIN_PASSCODE;
  // Priority for the pre-selected team:
  //   1. ?team=<slug> if present and resolvable
  //   2. The default team (historically 佐藤チーム) so /join alone still
  //      lands with something sensible pre-selected
  let team = slug && slug.length > 0 ? await findTeamBySlug(slug) : null;
  if (!team) {
    team = await findTeamByName(DEFAULT_TEAM_NAME);
  }
  return (
    <JoinForm
      requiresPasscode={requiresPasscode}
      defaultTeamId={team && team.active ? team.id : null}
    />
  );
}
