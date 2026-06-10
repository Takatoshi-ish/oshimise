// 住所→pref/city抽出 (Place Details の addressComponents から)
// 仕様: pref = administrative_area_level_1 / city = locality優先, 無ければ administrative_area_level_2

export type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

export function extractAreaParts(
  components?: AddressComponent[] | null,
): { pref: string | null; city: string | null } {
  if (!Array.isArray(components)) return { pref: null, city: null };
  let pref: string | null = null;
  let city: string | null = null;
  let cityFallback: string | null = null;
  for (const c of components) {
    const types = c.types ?? [];
    const text = c.longText ?? c.shortText ?? null;
    if (!text) continue;
    if (!pref && types.includes('administrative_area_level_1')) pref = text;
    if (!city && types.includes('locality')) city = text;
    if (!cityFallback && types.includes('administrative_area_level_2')) cityFallback = text;
  }
  return { pref, city: city ?? cityFallback };
}
