import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { withTransaction } from '@/lib/db';
import { PostShopSchema } from '@/lib/validation';
import { upsertShop, listShopCards } from '@/lib/repositories/shops';
import { listVisibleTeamIds } from '@/lib/repositories/teams';
import {
  insertRecommendation,
  MemberInactiveError,
} from '@/lib/repositories/recommendations';
import { attachPhotosToShop } from '@/lib/repositories/photos';
import { placeDetails, PlacesError } from '@/lib/places';
import {
  appendShop,
  appendRecommendation,
  fireAndForget,
} from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ListQuerySchema = z.object({
  pref: z.string().trim().min(1).max(30).optional().nullable(),
  city: z.string().trim().min(1).max(30).optional().nullable(),
  area: z.string().trim().min(1).max(30).optional().nullable(),
  genre: z.string().trim().min(1).max(30).optional().nullable(),
  q: z.string().trim().min(1).max(100).optional().nullable(),
  sort: z.enum(['new', 'count', 'recent_share']).default('new'),
  viewerTeamId: z.string().uuid().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = ListQuerySchema.safeParse({
    pref: sp.get('pref') || null,
    city: sp.get('city') || null,
    area: sp.get('area') || null,
    genre: sp.get('genre') || null,
    q: sp.get('q') || null,
    sort: sp.get('sort') || 'new',
    viewerTeamId: sp.get('viewerTeamId') || null,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  try {
    const visibleTeamIds = parsed.data.viewerTeamId
      ? await listVisibleTeamIds(parsed.data.viewerTeamId)
      : null;
    const cards = await listShopCards(parsed.data, parsed.data.sort, visibleTeamIds);
    return NextResponse.json(cards);
  } catch (e) {
    console.error('/api/shops GET error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid json' } },
      { status: 400 },
    );
  }
  const parsed = PostShopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  const { placeId, memberId, comment, priceLevel, genre, area, photoIds } =
    parsed.data;

  try {
    const result = await withTransaction(async (client) => {
      // Look up existing shop first to avoid an unnecessary Places API call
      const existing = await client.query<{ id: string }>(
        'SELECT id FROM shops WHERE place_id = $1',
        [placeId],
      );

      let shop;
      let createdNewShop = false;
      if (existing.rows.length > 0) {
        // Existing shop: read full row, do not re-fetch Places
        const r = await client.query<{
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
        }>(
          'SELECT id, place_id, name, address, lat, lng, genre, pref, city, area, price_level, gmap_url, created_at FROM shops WHERE id = $1',
          [existing.rows[0].id],
        );
        const row = r.rows[0];
        shop = {
          id: row.id,
          placeId: row.place_id,
          name: row.name,
          address: row.address,
          lat: row.lat !== null ? Number(row.lat) : null,
          lng: row.lng !== null ? Number(row.lng) : null,
          genre: row.genre,
          pref: row.pref,
          city: row.city,
          area: row.area,
          priceLevel: row.price_level,
          gmapUrl: row.gmap_url,
          createdAt: row.created_at,
        };
      } else {
        // New shop: fetch authoritative values from Places (server-side)
        const sessionToken = randomUUID();
        const details = await placeDetails(placeId, sessionToken);
        const { shop: newShop } = await upsertShop(client, {
          placeId: details.placeId,
          name: details.name,
          address: details.address,
          lat: details.lat,
          lng: details.lng,
          genre: genre ?? details.genreSuggestion ?? null,
          pref: details.pref,
          city: details.city,
          area: area ?? details.city,
          priceLevel: priceLevel ?? details.priceLevel,
          gmapUrl: details.gmapUrl,
        });
        shop = newShop;
        createdNewShop = true;
      }

      const rec = await insertRecommendation(
        client,
        shop.id,
        memberId,
        comment,
      );
      await attachPhotosToShop(client, photoIds, shop.id);

      return { shop, rec, createdNewShop };
    });

    // Fire-and-forget Sheets sync (failures logged, do not block the response)
    fireAndForget(
      'shops POST',
      (async () => {
        if (result.createdNewShop) {
          await appendShop(result.shop);
        }
        await appendRecommendation({
          id: result.rec.id,
          shopId: result.shop.id,
          shopName: result.shop.name,
          memberName: result.rec.memberName,
          teamName: result.rec.teamName,
          comment: comment,
          createdAt: result.rec.createdAt,
        });
      })(),
    );

    return NextResponse.json(
      { shop: result.shop, recommendationId: result.rec.id },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof MemberInactiveError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'member inactive or not found' } },
        { status: 400 },
      );
    }
    if (e instanceof PlacesError) {
      console.error('/api/shops places error', e);
      return NextResponse.json(
        { error: { code: 'PLACES_ERROR', message: e.message } },
        { status: 502 },
      );
    }
    console.error('/api/shops error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}
