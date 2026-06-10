import { query } from '../db';

export type Member = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

function toMember(x: Row): Member {
  return {
    id: x.id,
    name: x.name,
    active: x.active,
    createdAt: x.created_at,
  };
}

export async function listActiveMembers(): Promise<Member[]> {
  const r = await query<Row>(
    'SELECT id, name, active, created_at FROM members WHERE active = true ORDER BY name ASC',
  );
  return r.rows.map(toMember);
}

export async function listAllMembers(): Promise<Member[]> {
  const r = await query<Row>(
    'SELECT id, name, active, created_at FROM members ORDER BY active DESC, name ASC',
  );
  return r.rows.map(toMember);
}

export async function insertMember(name: string): Promise<Member> {
  const r = await query<Row>(
    'INSERT INTO members (name) VALUES ($1) RETURNING id, name, active, created_at',
    [name],
  );
  return toMember(r.rows[0]);
}

export async function updateMember(
  id: string,
  patch: { name?: string; active?: boolean },
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
  if (sets.length === 0) return null;
  params.push(id);
  const r = await query<Row>(
    `UPDATE members SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING id, name, active, created_at`,
    params,
  );
  return r.rows[0] ? toMember(r.rows[0]) : null;
}
