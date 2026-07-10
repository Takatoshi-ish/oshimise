import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import {
  listAllTeams,
  insertTeam,
  getTeamMemberCounts,
  getAllVisibility,
} from '@/lib/repositories/teams';
import { appendTeam, fireAndForget } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PostBody = z.object({
  name: z.string().trim().min(1).max(30),
});

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const [teams, counts, visibility] = await Promise.all([
    listAllTeams(),
    getTeamMemberCounts(),
    getAllVisibility(),
  ]);
  return NextResponse.json(
    teams.map((t) => ({
      ...t,
      memberCount: counts.get(t.id) ?? 0,
      visibleTeamIds: visibility.get(t.id) ?? [],
    })),
  );
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid json' } },
      { status: 400 },
    );
  }
  const parsed = PostBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  const team = await insertTeam(parsed.data.name);
  fireAndForget(
    'admin team POST',
    appendTeam({
      name: team.name,
      slug: team.slug,
      active: team.active,
      visibleTeamNames: [],
      createdAt: team.createdAt,
    }),
  );
  return NextResponse.json(team, { status: 201 });
}
