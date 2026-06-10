import { NextResponse, type NextRequest } from 'next/server';
import { placesAutocomplete, PlacesError } from '@/lib/places';
import { PlacesSearchQuery } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const parsed = PlacesSearchQuery.safeParse({
    q: req.nextUrl.searchParams.get('q') ?? '',
    sessiontoken: req.nextUrl.searchParams.get('sessiontoken') ?? '',
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  try {
    const suggestions = await placesAutocomplete(
      parsed.data.q,
      parsed.data.sessiontoken,
    );
    return NextResponse.json(suggestions);
  } catch (e) {
    if (e instanceof PlacesError) {
      console.error('/api/places/search error', e);
      return NextResponse.json(
        { error: { code: 'PLACES_ERROR', message: e.message } },
        { status: 502 },
      );
    }
    console.error('/api/places/search internal', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Unexpected error' } },
      { status: 500 },
    );
  }
}
