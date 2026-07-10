-- オシミセ DB schema (PostgreSQL 13+)
-- 純粋なPostgreSQL。gen_random_uuid() はPG13以降の組み込み関数。

CREATE TABLE IF NOT EXISTS members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shops (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    text UNIQUE NOT NULL,
  name        text NOT NULL,
  address     text,
  lat         double precision,
  lng         double precision,
  genre       text,
  pref        text,
  city        text,
  area        text,
  price_level int,
  gmap_url    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  member_id  uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  comment    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid REFERENCES shops(id) ON DELETE CASCADE,
  url        text NOT NULL,
  member_id  uuid REFERENCES members(id) ON DELETE SET NULL,
  source     text NOT NULL CHECK (source IN ('places', 'user')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shops_pref               ON shops(pref);
CREATE INDEX IF NOT EXISTS idx_shops_city               ON shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_genre              ON shops(genre);
CREATE INDEX IF NOT EXISTS idx_recommendations_shop_id  ON recommendations(shop_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created  ON recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_shop_id           ON photos(shop_id);

-- ===========================================================================
-- Phase 1: teams + per-team visibility
-- ===========================================================================

CREATE TABLE IF NOT EXISTS teams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 2: URL-based team scoping. slug is unguessable random text used
-- as the team's public URL segment: /t/<slug>. Nullable during migration
-- so ADD COLUMN is safe; app-side seeder and the seed.sql below populate
-- and then rely on the UNIQUE index.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS teams_slug_unique ON teams(slug);

-- 「viewer_team が visible_team の投稿を見れる」ことを表す方向性グラフ。
-- 自分自身は常に見える(SQL側でORで処理)ので登録不要。
CREATE TABLE IF NOT EXISTS team_visibility (
  viewer_team_id  uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  visible_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (viewer_team_id, visible_team_id)
);

-- ADD COLUMN IF NOT EXISTS (PG9.6+)
ALTER TABLE members ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id);

CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
