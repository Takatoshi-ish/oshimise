import { NextResponse } from 'next/server';
import { listDistinctValues } from '@/lib/repositories/shops';
import { GENRE_SUGGESTIONS } from '@/config/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Combined genre suggestion list:
//   • The curated GENRE_SUGGESTIONS from config (always available)
//   • Every distinct value already present in shops.genre
// Sorted by JA collation. Used by the compose modal combobox.
export async function GET() {
  try {
    const dbGenres = await listDistinctValues('genre');
    const merged = Array.from(
      new Set<string>([...GENRE_SUGGESTIONS, ...dbGenres]),
    ).sort((a, b) => a.localeCompare(b, 'ja'));
    return NextResponse.json(merged);
  } catch (e) {
    console.error('/api/genres error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}
