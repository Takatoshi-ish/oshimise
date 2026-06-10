import { extractAreaParts, type AddressComponent } from './area';
import { suggestGenre } from './genre';

const BASE = 'https://places.googleapis.com/v1';

export class PlacesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlacesError';
  }
}

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new PlacesError('GOOGLE_MAPS_API_KEY is not set');
  return key;
}

export type PlaceSuggestion = { placeId: string; description: string };

export async function placesAutocomplete(
  input: string,
  sessionToken: string,
): Promise<PlaceSuggestion[]> {
  const res = await fetch(`${BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      sessionToken,
      languageCode: 'ja',
      regionCode: 'jp',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new PlacesError(
      `Autocomplete failed: ${res.status} ${text.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    suggestions?: Array<{
      placePrediction?: { placeId?: string; text?: { text?: string } };
    }>;
  };
  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter(
      (p): p is { placeId: string; text?: { text?: string } } =>
        typeof p?.placeId === 'string' && p.placeId.length > 0,
    )
    .map((p) => ({ placeId: p.placeId, description: p.text?.text ?? '' }));
}

export type PlaceDetails = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  types: string[];
  priceLevel: number | null;
  pref: string | null;
  city: string | null;
  genreSuggestion: string;
  gmapUrl: string | null;
  photoRef: string | null;
};

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const DETAILS_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'types',
  'priceLevel',
  'photos',
  'googleMapsUri',
  'addressComponents',
].join(',');

type DetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  priceLevel?: string;
  photos?: Array<{ name?: string }>;
  googleMapsUri?: string;
  addressComponents?: AddressComponent[];
};

export async function placeDetails(
  placeId: string,
  sessionToken: string,
): Promise<PlaceDetails> {
  const url =
    `${BASE}/places/${encodeURIComponent(placeId)}` +
    `?sessionToken=${encodeURIComponent(sessionToken)}` +
    `&languageCode=ja&regionCode=jp`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': DETAILS_FIELDS,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new PlacesError(
      `Details failed: ${res.status} ${text.slice(0, 200)}`,
    );
  }
  const d = (await res.json()) as DetailsResponse;
  const { pref, city } = extractAreaParts(d.addressComponents);
  return {
    placeId: d.id ?? placeId,
    name: d.displayName?.text ?? '',
    address: d.formattedAddress ?? null,
    lat: d.location?.latitude ?? null,
    lng: d.location?.longitude ?? null,
    types: d.types ?? [],
    priceLevel: d.priceLevel ? (PRICE_MAP[d.priceLevel] ?? null) : null,
    pref,
    city,
    genreSuggestion: suggestGenre(d.types),
    gmapUrl: d.googleMapsUri ?? null,
    photoRef: d.photos?.[0]?.name ?? null,
  };
}
