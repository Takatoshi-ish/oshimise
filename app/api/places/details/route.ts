import { NextResponse, type NextRequest } from 'next/server';
import { placeDetails, PlacesError } from '@/lib/places';
import { PlacesDetailsQuery } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const parsed = PlacesDetailsQuery.safeParse({
    placeId: req.nextUrl.searchParams.get('placeId') ?? '',
    sessiontoken: req.nextUrl.searchParams.get('sessiontoken') ?? '',
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 },
    );
  }
  try {
    const details = await placeDetails(
      parsed.data.placeId,
      parsed.data.sessiontoken,
    );
    return NextResponse.json(details);
  } catch (e) {
    if (e instanceof PlacesError) {
      console.error('/api/places/details error', e);
      return NextResponse.json(
        { error: { code: 'PLACES_ERROR', message: e.message } },
        { status: 502 },
      );
    }
    console.error('/api/places/details internal', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Unexpected error' } },
      { status: 500 },
    );
  }
}
