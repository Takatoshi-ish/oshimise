import { google, type sheets_v4 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let _client: sheets_v4.Sheets | null = null;
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
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${name}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    });
  }
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
  '共有本文',
  '投稿日時',
];
const MEMBER_HEADERS = ['メンバー名', '状態', '追加日時'];

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
  comment: string;
  createdAt: string;
}): Promise<void> {
  await ensureTab(REC_TAB, REC_HEADERS);
  await appendRow(REC_TAB, [
    rec.id,
    rec.shopId,
    rec.shopName,
    rec.memberName,
    rec.comment,
    rec.createdAt,
  ]);
}

export async function appendMember(m: {
  name: string;
  active: boolean;
  createdAt: string;
}): Promise<void> {
  await ensureTab(MEMBER_TAB, MEMBER_HEADERS);
  await appendRow(MEMBER_TAB, [
    m.name,
    m.active ? '有効' : '無効',
    m.createdAt,
  ]);
}

// Wrap a sheet sync promise so failures only log (spec: fire-and-forget)
export function fireAndForget(label: string, p: Promise<unknown>): void {
  p.catch((e) => console.error(`[sheets sync failed: ${label}]`, e));
}
