import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import {
  updateTeam,
  deleteTeamIfNoMembers,
  setTeamVisibility,
  listVisibleTeamIds,
  listAllTeams,
  SlugTakenError,
} from '@/lib/repositories/teams';
import { appendTeam, fireAndForget } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Patch = z.object({
  name: z.string().trim().min(1).max(30).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,40}$/i, {
      message: 'slug は 3〜40文字の英数字とハイフンのみ',
    })
    .optional(),
  active: z.boolean().optional(),
  visibleTeamIds: z.array(z.string().uuid()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid json' } },
      { status: 400 },
    );
  }
  const parsed = Patch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  let updated;
  try {
    updated = await updateTeam(id, parsed.data);
  } catch (e) {
    if (e instanceof SlugTakenError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION',
            message: 'このslugは既に他のチームで使われています',
          },
        },
        { status: 400 },
      );
    }
    throw e;
  }
  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  if (parsed.data.visibleTeamIds !== undefined) {
    await setTeamVisibility(id, parsed.data.visibleTeamIds);
  }
  // Log every PATCH to the "チーム" tab so the spreadsheet keeps an event
  // history (name change, active toggle, visibility update).
  const [visibleIds, allTeams] = await Promise.all([
    listVisibleTeamIds(id),
    listAllTeams(),
  ]);
  const visibleNames = visibleIds
    .filter((vid) => vid !== id)
    .map((vid) => allTeams.find((t) => t.id === vid)?.name)
    .filter((n): n is string => !!n);
  fireAndForget(
    'admin team PATCH',
    appendTeam({
      name: updated.name,
      slug: updated.slug,
      active: updated.active,
      visibleTeamNames: visibleNames,
      createdAt: new Date().toISOString(),
    }),
  );
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const { id } = await params;
  const r = await deleteTeamIfNoMembers(id);
  if (!r.deleted) {
    if (r.reason === 'has_members') {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'team still has members' } },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
