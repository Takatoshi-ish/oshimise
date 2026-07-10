import { notFound } from 'next/navigation';
import { findTeamBySlug } from '@/lib/repositories/teams';
import { HomeContent } from '@/components/home/HomeContent';

export const dynamic = 'force-dynamic';

export default async function TeamScopedHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await findTeamBySlug(slug);
  if (!team || !team.active) notFound();
  return (
    <HomeContent
      lockedTeamId={team.id}
      lockedTeamName={team.name}
      lockedTeamSlug={team.slug ?? undefined}
    />
  );
}
