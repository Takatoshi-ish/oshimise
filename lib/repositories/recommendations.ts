import type { PoolClient } from 'pg';
import { query } from '@/lib/db';

export type Recommendation = {
  id: string;
  shopId: string;
  memberId: string;
  memberName: string;
  comment: string;
  createdAt: string;
};

type Row = {
  id: string;
  shop_id: string;
  member_id: string;
  member_name: string;
  comment: string;
  created_at: string;
};

function toRec(r: Row): Recommendation {
  return {
    id: r.id,
    shopId: r.shop_id,
    memberId: r.member_id,
    memberName: r.member_name,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

export class MemberInactiveError extends Error {
  constructor() {
    super('member is inactive or not found');
    this.name = 'MemberInactiveError';
  }
}

export async function insertRecommendation(
  client: PoolClient,
  shopId: string,
  memberId: string,
  comment: string,
): Promise<{ id: string; createdAt: string; memberName: string }> {
  const m = await client.query<{ active: boolean; name: string }>(
    'SELECT active, name FROM members WHERE id = $1',
    [memberId],
  );
  if (m.rows.length === 0 || !m.rows[0].active) {
    throw new MemberInactiveError();
  }
  const r = await client.query<{ id: string; created_at: string }>(
    'INSERT INTO recommendations (shop_id, member_id, comment) VALUES ($1, $2, $3) RETURNING id, created_at',
    [shopId, memberId, comment],
  );
  return {
    id: r.rows[0].id,
    createdAt: r.rows[0].created_at,
    memberName: m.rows[0].name,
  };
}

export async function listRecommendationsByShop(
  shopId: string,
): Promise<Recommendation[]> {
  const r = await query<Row>(
    `SELECT r.id, r.shop_id, r.member_id, r.comment, r.created_at, m.name AS member_name
     FROM recommendations r
     JOIN members m ON m.id = r.member_id
     WHERE r.shop_id = $1
     ORDER BY r.created_at DESC`,
    [shopId],
  );
  return r.rows.map(toRec);
}

export type FeedItem = {
  recommendationId: string;
  memberName: string;
  comment: string;
  createdAt: string;
  shop: {
    id: string;
    name: string;
    genre: string | null;
    pref: string | null;
    area: string | null;
    priceLevel: number | null;
  };
};

type FeedRow = {
  recommendation_id: string;
  comment: string;
  created_at: string;
  member_name: string;
  shop_id: string;
  shop_name: string;
  shop_genre: string | null;
  shop_pref: string | null;
  shop_area: string | null;
  shop_price_level: number | null;
};

export type AdminRecItem = Recommendation & { shopName: string };

type AdminRecRow = Row & { shop_name: string };

export async function listAllRecommendationsForAdmin(): Promise<AdminRecItem[]> {
  const r = await query<AdminRecRow>(
    `SELECT r.id, r.shop_id, r.member_id, r.comment, r.created_at,
            m.name AS member_name,
            s.name AS shop_name
     FROM recommendations r
     JOIN members m ON m.id = r.member_id
     JOIN shops s ON s.id = r.shop_id
     ORDER BY r.created_at DESC`,
  );
  return r.rows.map((row) => ({ ...toRec(row), shopName: row.shop_name }));
}

export async function updateRecommendation(
  id: string,
  comment: string,
): Promise<boolean> {
  const r = await query<{ id: string }>(
    'UPDATE recommendations SET comment = $1 WHERE id = $2 RETURNING id',
    [comment, id],
  );
  return r.rows.length > 0;
}

export async function deleteRecommendation(id: string): Promise<boolean> {
  const r = await query<{ id: string }>(
    'DELETE FROM recommendations WHERE id = $1 RETURNING id',
    [id],
  );
  return r.rows.length > 0;
}

export async function listFeed(filters: {
  pref?: string | null;
  genre?: string | null;
  offset?: number;
  visibleTeamIds?: string[] | null;
}): Promise<FeedItem[]> {
  const r = await query<FeedRow>(
    `SELECT
       r.id AS recommendation_id, r.comment, r.created_at,
       m.name AS member_name,
       s.id AS shop_id, s.name AS shop_name, s.genre AS shop_genre,
       s.pref AS shop_pref, s.area AS shop_area, s.price_level AS shop_price_level
     FROM recommendations r
     JOIN shops s ON s.id = r.shop_id
     JOIN members m ON m.id = r.member_id
     WHERE
       ($1::text IS NULL OR s.pref = $1)
       AND ($2::text IS NULL OR s.genre = $2)
       AND ($4::uuid[] IS NULL OR m.team_id = ANY($4::uuid[]))
     ORDER BY r.created_at DESC
     LIMIT 50 OFFSET $3`,
    [
      filters.pref ?? null,
      filters.genre ?? null,
      filters.offset ?? 0,
      filters.visibleTeamIds ?? null,
    ],
  );
  return r.rows.map((x) => ({
    recommendationId: x.recommendation_id,
    memberName: x.member_name,
    comment: x.comment,
    createdAt: x.created_at,
    shop: {
      id: x.shop_id,
      name: x.shop_name,
      genre: x.shop_genre,
      pref: x.shop_pref,
      area: x.shop_area,
      priceLevel: x.shop_price_level,
    },
  }));
}
