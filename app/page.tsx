import { findTeamByName } from '@/lib/repositories/teams';
import { HomeContent } from '@/components/home/HomeContent';
import { DEFAULT_TEAM_NAME } from '@/lib/defaultTeam';

export const dynamic = 'force-dynamic';

// "/" doubles as the default team's app URL (historically 佐藤チーム).
// This keeps existing bookmarks working and gives that team a nice short
// URL while every other team uses /t/<slug>.
export default async function HomePage() {
  const defaultTeam = await findTeamByName(DEFAULT_TEAM_NAME);
  if (defaultTeam && defaultTeam.active) {
    return (
      <HomeContent
        lockedTeamId={defaultTeam.id}
        lockedTeamName={defaultTeam.name}
        // Note: intentionally omitting lockedTeamSlug so shop-detail
        // navigations from "/" go back to "/" (not /t/<slug>). This
        // preserves the "佐藤チーム bookmarks '/'" convention.
      />
    );
  }
  // Fallback for setups where the default team hasn't been created yet:
  // render the free (viewer-team switcher) view so the site still boots.
  return <HomeContent />;
}
