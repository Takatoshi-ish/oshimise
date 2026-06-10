import { NextResponse, type NextRequest } from 'next/server';
import { withTransaction } from '@/lib/db';
import { PostRecSchema } from '@/lib/validation';
import {
  insertRecommendation,
  MemberInactiveError,
} from '@/lib/repositories/recommendations';
import { attachPhotosToShop } from '@/lib/repositories/photos';
import { appendRecommendation, fireAndForget } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

class ShopNotFoundError extends Error {
  constructor() {
    super('shop not found');
    this.name = 'ShopNotFoundError';
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
  const parsed = PostRecSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  const { shopId, memberId, comment, photoIds } = parsed.data;

  try {
    const result = await withTransaction(async (client) => {
      const s = await client.query<{ id: string; name: string }>(
        'SELECT id, name FROM shops WHERE id = $1',
        [shopId],
      );
      if (s.rows.length === 0) throw new ShopNotFoundError();
      const shopName = s.rows[0].name;
      const rec = await insertRecommendation(
        client,
        shopId,
        memberId,
        comment,
      );
      await attachPhotosToShop(client, photoIds, shopId);
      return { rec, shopName };
    });

    // Fire-and-forget Sheets sync
    fireAndForget(
      'recommendations POST',
      appendRecommendation({
        id: result.rec.id,
        shopId,
        shopName: result.shopName,
        memberName: result.rec.memberName,
        comment,
        createdAt: result.rec.createdAt,
      }),
    );

    return NextResponse.json(
      { recommendationId: result.rec.id },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof ShopNotFoundError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'shop not found' } },
        { status: 404 },
      );
    }
    if (e instanceof MemberInactiveError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'member inactive or not found' } },
        { status: 400 },
      );
    }
    console.error('/api/recommendations error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}
