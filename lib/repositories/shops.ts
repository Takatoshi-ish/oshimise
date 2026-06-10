import type { PoolClient } from 'pg';
import { query } from '@/lib/db';

export type Shop = {
  id: string;
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  gmapUrl: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  price_level: number | null;
  gmap_url: string | null;
  created_at: string;
};

const FIELDS =
  'id, place_id, name, address, lat, lng, genre, pref, city, area, price_level, gmap_url, created_at';

function toShop(r: Row): Shop {
  return {
    id: r.id,
    placeId: r.place_id,
    name: r.name,
    address: r.address,
    lat: r.lat !== null ? Number(r.lat) : null,
    lng: r.lng !== null ? Number(r.lng) : null,
    genre: r.genre,
    pref: r.pref,
    city: r.city,
    area: r.area,
    priceLevel: r.price_level,
    gmapUrl: r.gmap_url,
    createdAt: r.created_at,
  };
}

export async function findShopByPlaceId(placeId: string): Promise<Shop | null> {
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM shops WHERE place_id = $1`,
    [placeId],
  );
  return r.rows[0] ? toShop(r.rows[0]) : null;
}

export async function findShopById(id: string): Promise<Shop | null> {
  // Guard against malformed UUID to avoid Postgres errors leaking out
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }
  const r = await query<Row>(
    `SELECT ${FIELDS} FROM shops WHERE id = $1`,
    [id],
  );
  return r.rows[0] ? toShop(r.rows[0]) : null;
}

export type ShopInsert = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  gmapUrl: string | null;
};

// Atomic upsert: insert if new, return existing if present.
export async function upsertShop(
  client: PoolClient,
  data: ShopInsert,
): Promise<{ shop: Shop; created: boolean }> {
  const ins = await client.query<Row>(
    `INSERT INTO shops (place_id, name, address, lat, lng, genre, pref, city, area, price_level, gmap_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (place_id) DO NOTHING
     RETURNING ${FIELDS}`,
    [
      data.placeId,
      data.name,
      data.address,
      data.lat,
      data.lng,
      data.genre,
      data.pref,
      data.city,
      data.area,
      data.priceLevel,
      data.gmapUrl,
    ],
  );
  if (ins.rows.length > 0) {
    return { shop: toShop(ins.rows[0]), created: true };
  }
  const sel = await client.query<Row>(
    `SELECT ${FIELDS} FROM shops WHERE place_id = $1`,
    [data.placeId],
  );
  return { shop: toShop(sel.rows[0]), created: false };
}

export type ShopCard = {
  id: string;
  name: string;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  lat: number | null;
  lng: number | null;
  shareCount: number;
  thumbnailUrl: string | null;
};

export type ShopListFilters = {
  pref?: string | null;
  city?: string | null;
  area?: string | null;
  genre?: string | null;
  q?: string | null;
};

type CardRow = {
  id: string;
  name: string;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  price_level: number | null;
  lat: number | null;
  lng: number | null;
  share_count: string;
  thumbnail_url: string | null;
};

export async function listShopCards(
  filters: ShopListFilters,
  sort: 'new' | 'count' | 'recent_share',
): Promise<ShopCard[]> {
  const orderBy =
    sort === 'count'
      ? 'share_count DESC, s.created_at DESC'
      : sort === 'recent_share'
        ? '(SELECT MAX(created_at) FROM recommendations WHERE shop_id = s.id) DESC NULLS LAST, s.created_at DESC'
        : 's.created_at DESC';
  const r = await query<CardRow>(
    `SELECT
       s.id, s.name, s.genre, s.pref, s.city, s.area,
       s.price_level, s.lat, s.lng,
       COUNT(DISTINCT r.id) AS share_count,
       (
         SELECT p.url FROM photos p
         WHERE p.shop_id = s.id
         ORDER BY p.created_at ASC LIMIT 1
       ) AS thumbnail_url
     FROM shops s
     LEFT JOIN recommendations r ON r.shop_id = s.id
     WHERE
       ($1::text IS NULL OR s.pref = $1)
       AND ($2::text IS NULL OR s.city = $2)
       AND ($3::text IS NULL OR s.area = $3)
       AND ($4::text IS NULL OR s.genre = $4)
       AND (
         $5::text IS NULL
         OR s.name ILIKE '%' || $5 || '%'
         OR EXISTS (
           SELECT 1 FROM recommendations rr
           WHERE rr.shop_id = s.id AND rr.comment ILIKE '%' || $5 || '%'
         )
       )
     GROUP BY s.id
     ORDER BY ${orderBy}
     LIMIT 50`,
    [
      filters.pref ?? null,
      filters.city ?? null,
      filters.area ?? null,
      filters.genre ?? null,
      filters.q ?? null,
    ],
  );
  return r.rows.map((x) => ({
    id: x.id,
    name: x.name,
    genre: x.genre,
    pref: x.pref,
    city: x.city,
    area: x.area,
    priceLevel: x.price_level,
    lat: x.lat !== null ? Number(x.lat) : null,
    lng: x.lng !== null ? Number(x.lng) : null,
    shareCount: Number(x.share_count),
    thumbnailUrl: x.thumbnail_url,
  }));
}

export type AdminShopItem = Shop & { shareCount: number; photoCount: number };

type AdminShopRow = Row & { share_count: string; photo_count: string };

export async function listAllShopsForAdmin(): Promise<AdminShopItem[]> {
  const r = await query<AdminShopRow>(
    `SELECT ${FIELDS},
       (SELECT COUNT(*) FROM recommendations WHERE shop_id = shops.id) AS share_count,
       (SELECT COUNT(*) FROM photos WHERE shop_id = shops.id) AS photo_count
     FROM shops
     ORDER BY created_at DESC`,
  );
  return r.rows.map((row) => ({
    ...toShop(row),
    shareCount: Number(row.share_count),
    photoCount: Number(row.photo_count),
  }));
}

export type ShopUpdate = {
  name?: string;
  genre?: string | null;
  pref?: string | null;
  city?: string | null;
  area?: string | null;
  priceLevel?: number | null;
  lat?: number | null;
  lng?: number | null;
};

const SHOP_PATCH_COLS: Record<keyof ShopUpdate, string> = {
  name: 'name',
  genre: 'genre',
  pref: 'pref',
  city: 'city',
  area: 'area',
  priceLevel: 'price_level',
  lat: 'lat',
  lng: 'lng',
};

export async function updateShop(
  id: string,
  patch: ShopUpdate,
): Promise<Shop | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [k, col] of Object.entries(SHOP_PATCH_COLS)) {
    const v = (patch as Record<string, unknown>)[k];
    if (v === undefined) continue;
    params.push(v);
    sets.push(`${col} = $${params.length}`);
  }
  if (sets.length === 0) return null;
  params.push(id);
  const r = await query<Row>(
    `UPDATE shops SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING ${FIELDS}`,
    params,
  );
  return r.rows[0] ? toShop(r.rows[0]) : null;
}

export async function deleteShop(id: string): Promise<boolean> {
  const r = await query<{ id: string }>(
    'DELETE FROM shops WHERE id = $1 RETURNING id',
    [id],
  );
  return r.rows.length > 0;
}

export async function listDistinctValues(
  field: 'pref' | 'city' | 'area' | 'genre',
): Promise<string[]> {
  const r = await query<{ v: string }>(
    `SELECT DISTINCT ${field} AS v FROM shops WHERE ${field} IS NOT NULL AND ${field} <> '' ORDER BY v ASC`,
  );
  return r.rows.map((x) => x.v);
}
