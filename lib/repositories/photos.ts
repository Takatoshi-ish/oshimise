import type { PoolClient } from 'pg';
import { query } from '@/lib/db';

export type Photo = {
  id: string;
  shopId: string | null;
  url: string;
  memberId: string | null;
  source: 'places' | 'user';
  createdAt: string;
};

type Row = {
  id: string;
  shop_id: string | null;
  url: string;
  member_id: string | null;
  source: 'places' | 'user';
  created_at: string;
};

const FIELDS = 'id, shop_id, url, member_id, source, created_at';

function toPhoto(r: Row): Photo {
  return {
    id: r.id,
    shopId: r.shop_id,
    url: r.url,
    memberId: r.member_id,
    source: r.source,
    createdAt: r.created_at,
  };
}

export async function insertPhoto(data: {
  url: string;
  memberId: string | null;
  source: 'places' | 'user';
}): Promise<Photo> {
  const r = await query<Row>(
    `INSERT INTO photos (shop_id, url, member_id, source)
     VALUES (NULL, $1, $2, $3)
     RETURNING ${FIELDS}`,
    [data.url, data.memberId, data.source],
  );
  return toPhoto(r.rows[0]);
}

export async function attachPhotosToShop(
  client: PoolClient,
  photoIds: string[],
  shopId: string,
): Promise<void> {
  if (photoIds.length === 0) return;
  await client.query(
    'UPDATE photos SET shop_id = $1 WHERE id = ANY($2::uuid[]) AND shop_id IS NULL',
    [shopId, photoIds],
  );
}

export async function listPhotosByShop(shopId: string): Promise<Photo[]> {
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM photos WHERE shop_id = $1 ORDER BY created_at ASC`,
    [shopId],
  );
  return r.rows.map(toPhoto);
}
