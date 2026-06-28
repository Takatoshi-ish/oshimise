import { query } from '../db';

export type Member = {
  id: string;
  name: string;
  active: boolean;
  teamId: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  active: boolean;
  team_id: string | null;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toMember(x: Row): Member {
  return {
    id: x.id,
    name: x.name,
    active: x.active,
    teamId: x.team_id,
    createdAt: x.created_at,
  };
}

const FIELDS = 'id, name, active, team_id, created_at';

export async function listActiveMembers(teamId?: string): Promise<Member[]> {
  if (teamId !== undefined) {
    if (!UUID_RE.test(teamId)) return [];
    const r = await query<Row>(
      `SELECT ${FIELDS} FROM members WHERE active = true AND team_id = $1 ORDER BY name ASC`,
      [teamId],
    );
    return r.rows.map(toMember);
  }
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM members WHERE active = true ORDER BY name ASC`,
  );
  return r.rows.map(toMember);
}

export async function listAllMembers(): Promise<Member[]> {
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM members ORDER BY active DESC, name ASC`,
  );
  return r.rows.map(toMember);
}

export async function insertMember(
  name: string,
  teamId: string | null = null,
): Promise<Member> {
  const r = await query<Row>(
    `INSERT INTO members (name, team_id) VALUES ($1, $2)
     RETURNING ${FIELDS}`,
    [name, teamId],
  );
  return toMember(r.rows[0]);
}

export type DeleteMemberResult =
  | { deleted: true }
  | { deleted: false; reason: 'has_recommendations' | 'not_found' };

/**
 * Hard-delete a member. Blocks if the member still has at least one
 * recommendation, because recommendations.member_id is ON DELETE RESTRICT
 * and we want to surface the conflict as a friendly admin message
 * instead of leaking a Postgres FK error.
 */
export async function deleteMemberIfNoRecommendations(
  id: string,
): Promise<DeleteMemberResult> {
  if (!UUID_RE.test(id)) return { deleted: false, reason: 'not_found' };
  const r = await query<{ c: string }>(
    'SELECT COUNT(*)::text AS c FROM recommendations WHERE member_id = $1',
    [id],
  );
  if (Number(r.rows[0].c) > 0) {
    return { deleted: false, reason: 'has_recommendations' };
  }
  const del = await query<{ id: string }>(
    'DELETE FROM members WHERE id = $1 RETURNING id',
    [id],
  );
  return del.rows.length > 0
    ? { deleted: true }
    : { deleted: false, reason: 'not_found' };
}

export async function updateMember(
  id: string,
  patch: { name?: string; active?: boolean; teamId?: string | null },
): Promise<Member | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (typeof patch.name === 'string') {
    params.push(patch.name);
    sets.push(`name = $${params.length}`);
  }
  if (typeof patch.active === 'boolean') {
    params.push(patch.active);
    sets.push(`active = $${params.length}`);
  }
  if (patch.teamId !== undefined) {
    params.push(patch.teamId);
    sets.push(`team_id = $${params.length}`);
  }
  if (sets.length === 0) return null;
  params.push(id);
  const r = await query<Row>(
    `UPDATE members SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING ${FIELDS}`,
    params,
  );
  return r.rows[0] ? toMember(r.rows[0]) : null;
}
