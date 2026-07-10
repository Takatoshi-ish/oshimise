import { google, type sheets_v4 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let _client: sheets_v4.Sheets | null = null;
// Per-tab cache for "is tab created and headers up to date" so we only hit
// the metadata + values.update API once per server process per tab.
const ensuredTabs = new Set<string>();

function getSheetsId(): string {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error('GOOGLE_SHEETS_ID not set');
  return id;
}

function getClient(): sheets_v4.Sheets {
  if (_client) return _client;
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');
  const creds = JSON.parse(json) as {
    client_email: string;
    private_key: string;
  };
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });
  _client = google.sheets({ version: 'v4', auth });
  return _client;
}

function colLetter(n: number): string {
  let s = '';
  let x = n;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

async function ensureTab(name: string, headers: string[]): Promise<void> {
  if (ensuredTabs.has(name)) return;
  const sheets = getClient();
  const spreadsheetId = getSheetsId();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });
  const titles = (meta.data.sheets ?? [])
    .map((s) => s.properties?.title)
    .filter((t): t is string => typeof t === 'string');
  if (!titles.includes(name)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: name } } }],
      },
    });
  }
  // Always overwrite the header row so the live schema matches the data we
  // append below — even if the tab pre-existed with an older header set.
  const lastCol = colLetter(headers.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${name}!A1:${lastCol}1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [headers] },
  });
  ensuredTabs.add(name);
}

async function appendRow(
  name: string,
  row: (string | number | null)[],
): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetsId(),
    range: `${name}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

const SHOP_TAB = '店舗';
const REC_TAB = 'みんなの共有';
const MEMBER_TAB = 'メンバー';
const TEAM_TAB = 'チーム';

const SHOP_HEADERS = [
  '店舗ID',
  '店名',
  'ジャンル',
  '都道府県',
  '市区町村',
  'エリア',
  '価格帯',
  '緯度',
  '経度',
  'GoogleマップURL',
  '投稿日時',
];
const REC_HEADERS = [
  '共有ID',
  '店舗ID',
  '店名',
  '投稿者',
  '投稿者チーム',
  '共有本文',
  '投稿日時',
];
const MEMBER_HEADERS = ['メンバー名', 'チーム', '状態', '追加日時'];
const TEAM_HEADERS = ['チーム名', 'slug', '状態', '閲覧可能チーム', '追加日時'];

export async function appendShop(shop: {
  id: string;
  name: string;
  genre: string | null;
  pref: string | null;
  city: string | null;
  area: string | null;
  priceLevel: number | null;
  lat: number | null;
  lng: number | null;
  gmapUrl: string | null;
  createdAt: string;
}): Promise<void> {
  await ensureTab(SHOP_TAB, SHOP_HEADERS);
  await appendRow(SHOP_TAB, [
    shop.id,
    shop.name,
    shop.genre ?? '',
    shop.pref ?? '',
    shop.city ?? '',
    shop.area ?? '',
    shop.priceLevel ?? '',
    shop.lat ?? '',
    shop.lng ?? '',
    shop.gmapUrl ?? '',
    shop.createdAt,
  ]);
}

export async function appendRecommendation(rec: {
  id: string;
  shopId: string;
  shopName: string;
  memberName: string;
  /** Team name at the moment of posting (may be empty for legacy unassigned members). */
  teamName?: string | null;
  comment: string;
  createdAt: string;
}): Promise<void> {
  await ensureTab(REC_TAB, REC_HEADERS);
  await appendRow(REC_TAB, [
    rec.id,
    rec.shopId,
    rec.shopName,
    rec.memberName,
    rec.teamName ?? '',
    rec.comment,
    rec.createdAt,
  ]);
}

export async function appendMember(m: {
  name: string;
  active: boolean;
  /** Team name at the moment of this event. */
  teamName?: string | null;
  createdAt: string;
}): Promise<void> {
  await ensureTab(MEMBER_TAB, MEMBER_HEADERS);
  await appendRow(MEMBER_TAB, [
    m.name,
    m.teamName ?? '',
    m.active ? '有効' : '無効',
    m.createdAt,
  ]);
}

export async function appendTeam(t: {
  name: string;
  slug?: string | null;
  active: boolean;
  /** Names of teams this team can view (excluding self). */
  visibleTeamNames: string[];
  createdAt: string;
}): Promise<void> {
  await ensureTab(TEAM_TAB, TEAM_HEADERS);
  await appendRow(TEAM_TAB, [
    t.name,
    t.slug ?? '',
    t.active ? '有効' : '無効',
    t.visibleTeamNames.length > 0 ? t.visibleTeamNames.join(', ') : '(自チームのみ)',
    t.createdAt,
  ]);
}

// Wrap a sheet sync promise so failures only log (spec: fire-and-forget)
export function fireAndForget(label: string, p: Promise<unknown>): void {
  p.catch((e) => console.error(`[sheets sync failed: ${label}]`, e));
}
