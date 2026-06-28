const DRAFT_KEY = 'oshimise:draft';
const LAST_MEMBER_KEY = 'oshimise:lastMember';
const LAST_MEMBER_NAME_KEY = 'oshimise:lastMemberName';
const LAST_TEAM_KEY = 'oshimise:lastTeam';

export type DraftPlace = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  pref: string | null;
  city: string | null;
  gmapUrl: string | null;
  genreSuggestion: string;
};

export type DraftPayload = {
  place: DraftPlace | null;
  pinLat: number | null;
  pinLng: number | null;
  comment: string;
  priceLevel: number | null;
  area: string;
  genre: string;
  memberId: string;
  teamId?: string;
  photos: { id: string; url: string }[];
};

export function loadDraft(): DraftPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftPayload;
  } catch {
    return null;
  }
}

export function saveDraft(draft: DraftPayload): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DRAFT_KEY);
}

export function loadLastMember(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_MEMBER_KEY);
}

export function saveLastMember(memberId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_MEMBER_KEY, memberId);
}

export function loadLastMemberName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_MEMBER_NAME_KEY);
}

export function saveLastMemberName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_MEMBER_NAME_KEY, name);
}

export function loadLastTeam(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_TEAM_KEY);
}

export function saveLastTeam(teamId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_TEAM_KEY, teamId);
}
