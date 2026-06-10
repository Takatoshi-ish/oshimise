export const MEMBERS: { name: string }[] = [
  { name: '佐藤光輝' },
  { name: '久松博仁' },
  { name: '阿部勝也' },
  { name: '秋永芳治' },
  { name: '孫左近哲広' },
  { name: '上本直輝' },
  { name: '前田直毅' },
  { name: '深沢圭貴' },
  { name: '佐橋里香' },
  { name: '山本真季子' },
  { name: '青木麻莉' },
  { name: '佐伯信一郎' },
  { name: '石黒貴俊' },
];

export const AREA_SUGGESTIONS: string[] = [
  '渋谷', '新宿', '下北沢', '吉祥寺', '中目黒', '恵比寿', '池袋', '銀座',
  '横浜', '鎌倉', '京都', '大阪', '神戸', '名古屋', '福岡', '札幌',
];

export const GENRE_SUGGESTIONS: string[] = [
  'ラーメン', 'そば', 'うどん', '寿司', '焼肉', '居酒屋', 'バー',
  '中華', 'イタリアン', 'フレンチ', '和食', '洋食', 'カフェ', 'パン',
  'スイーツ', 'パスタ', 'カレー', 'ピザ', '定食',
  '書店', '雑貨', '古着', '花屋', 'ギャラリー',
];

// Place types → 初期ジャンル提案 (最初に一致した値を採用)
export const PLACE_TYPE_TO_GENRE: Record<string, string> = {
  ramen_restaurant: 'ラーメン',
  sushi_restaurant: '寿司',
  japanese_restaurant: '和食',
  italian_restaurant: 'イタリアン',
  french_restaurant: 'フレンチ',
  chinese_restaurant: '中華',
  korean_restaurant: '韓国料理',
  cafe: 'カフェ',
  coffee_shop: 'カフェ',
  bakery: 'パン',
  bar: 'バー',
  restaurant: '和食',
  book_store: '書店',
  florist: '花屋',
  clothing_store: '古着',
  store: '雑貨',
};

export const PHOTO_LIMIT_PER_POST = 5;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_RESIZE_LONG_EDGE = 1600;
export const PHOTO_JPEG_QUALITY = 80;

// 地図初期表示: コールドスタートは東京駅中心 zoom 5 (全国が見える)
export const MAP_DEFAULT_CENTER = { lat: 35.681, lng: 139.767 };
export const MAP_DEFAULT_ZOOM = 5;
