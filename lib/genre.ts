import { PLACE_TYPE_TO_GENRE } from '@/config/data';

// types→ジャンル提案: PLACE_TYPE_TO_GENRE の最初の一致値を返す。無ければ空文字。
export function suggestGenre(types?: string[] | null): string {
  if (!Array.isArray(types)) return '';
  for (const t of types) {
    const mapped = PLACE_TYPE_TO_GENRE[t];
    if (mapped) return mapped;
  }
  return '';
}
