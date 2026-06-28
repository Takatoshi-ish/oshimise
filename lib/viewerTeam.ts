const KEY = 'oshimise:viewerTeamId';

export function loadViewerTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function saveViewerTeamId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, id);
}

export function clearViewerTeamId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
