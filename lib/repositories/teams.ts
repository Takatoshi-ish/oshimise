import { query } from '../db';

export type Team = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
  created_at: string;
};

/**
 * Generate a URL-safe unguessable slug for a new team.
 * Uses crypto.randomUUID (available in Node 18+ / browsers) and takes
 * the first 12 hex chars — ~48 bits of entropy, plenty for share links.
 */
function generateSlug(): string {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).slice(2);
  return raw.slice(0, 12);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toTeam(r: Row): Team {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    active: r.active,
    createdAt: r.created_at,
  };
}

const FIELDS = 'id, name, slug, active, created_at';

export async function listActiveTeams(): Promise<Team[]> {
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM teams WHERE active = true ORDER BY name ASC`,
  );
  return r.rows.map(toTeam);
}

export async function listAllTeams(): Promise<Team[]> {
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM teams ORDER BY active DESC, name ASC`,
  );
  return r.rows.map(toTeam);
}

export async function findTeamById(id: string): Promise<Team | null> {
  if (!UUID_RE.test(id)) return null;
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM teams WHERE id = $1`,
    [id],
  );
  return r.rows[0] ? toTeam(r.rows[0]) : null;
}

export async function findTeamByName(name: string): Promise<Team | null> {
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM teams WHERE name = $1 LIMIT 1`,
    [name],
  );
  return r.rows[0] ? toTeam(r.rows[0]) : null;
}

export async function findTeamBySlug(slug: string): Promise<Team | null> {
  // slug alphabet is [a-z0-9], length 8..40 as a sanity gate before hitting DB
  if (!/^[a-z0-9]{8,40}$/.test(slug)) return null;
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM teams WHERE slug = $1`,
    [slug],
  );
  return r.rows[0] ? toTeam(r.rows[0]) : null;
}

export async function insertTeam(name: string): Promise<Team> {
  // Retry a few times on the astronomically unlikely slug collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    try {
      const r = await query<Row>(
        `INSERT INTO teams (name, slug) VALUES ($1, $2)
         RETURNING ${FIELDS}`,
        [name, slug],
      );
      return toTeam(r.rows[0]);
    } catch (e) {
      // 23505 = unique_violation on teams_slug_unique; try another slug
      if ((e as { code?: string }).code === '23505' && attempt < 4) continue;
      throw e;
    }
  }
  throw new Error('failed to generate a unique slug for the new team');
}

export async function updateTeam(
  id: string,
  patch: { name?: string; active?: boolean },
): Promise<Team | null> {
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
  if (sets.length === 0) return findTeamById(id);
  params.push(id);
  const r = await query<Row>(
    `UPDATE teams SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING ${FIELDS}`,
    params,
  );
  return r.rows[0] ? toTeam(r.rows[0]) : null;
}

export type DeleteTeamResult =
  | { deleted: true }
  | { deleted: false; reason: 'has_members' | 'not_found' };

export async function deleteTeamIfNoMembers(
  id: string,
): Promise<DeleteTeamResult> {
  const m = await query<{ c: string }>(
    'SELECT COUNT(*)::text AS c FROM members WHERE team_id = $1',
    [id],
  );
  if (Number(m.rows[0].c) > 0) return { deleted: false, reason: 'has_members' };
  const r = await query<{ id: string }>(
    'DELETE FROM teams WHERE id = $1 RETURNING id',
    [id],
  );
  return r.rows.length > 0
    ? { deleted: true }
    : { deleted: false, reason: 'not_found' };
}

/**
 * Resolve which team_ids a given viewer team is allowed to see (incl. self).
 * Returns [] when viewerTeamId is invalid → API should treat as "see nothing".
 */
export async function listVisibleTeamIds(
  viewerTeamId: string,
): Promise<string[]> {
  if (!UUID_RE.test(viewerTeamId)) return [];
  const r = await query<{ visible_team_id: string }>(
    'SELECT visible_team_id FROM team_visibility WHERE viewer_team_id = $1',
    [viewerTeamId],
  );
  return Array.from(
    new Set([viewerTeamId, ...r.rows.map((x) => x.visible_team_id)]),
  );
}

/** Replace the visibility set for one viewer team (excluding self). */
export async function setTeamVisibility(
  viewerTeamId: string,
  visibleTeamIds: string[],
): Promise<void> {
  const filtered = Array.from(
    new Set(visibleTeamIds.filter((id) => id !== viewerTeamId && UUID_RE.test(id))),
  );
  await query('DELETE FROM team_visibility WHERE viewer_team_id = $1', [
    viewerTeamId,
  ]);
  if (filtered.length === 0) return;
  const values = filtered.map((_, i) => `($1, $${i + 2})`).join(', ');
  await query(
    `INSERT INTO team_visibility (viewer_team_id, visible_team_id) VALUES ${values}`,
    [viewerTeamId, ...filtered],
  );
}

export async function getTeamMemberCounts(): Promise<Map<string, number>> {
  const r = await query<{ team_id: string; c: string }>(
    "SELECT team_id, COUNT(*)::text AS c FROM members WHERE team_id IS NOT NULL GROUP BY team_id",
  );
  const map = new Map<string, number>();
  for (const row of r.rows) map.set(row.team_id, Number(row.c));
  return map;
}

/** All visibility rows grouped by viewer_team_id (self not included). */
export async function getAllVisibility(): Promise<Map<string, string[]>> {
  const r = await query<{ viewer_team_id: string; visible_team_id: string }>(
    'SELECT viewer_team_id, visible_team_id FROM team_visibility',
  );
  const map = new Map<string, string[]>();
  for (const row of r.rows) {
    const arr = map.get(row.viewer_team_id) ?? [];
    arr.push(row.visible_team_id);
    map.set(row.viewer_team_id, arr);
  }
  return map;
}
