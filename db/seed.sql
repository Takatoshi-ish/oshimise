-- オシミセ 初期データ
-- 冪等: 既にあれば追加しない

-- ===========================================================================
-- メンバー13名
-- ===========================================================================
INSERT INTO members (name)
SELECT v
FROM (VALUES
  ('佐藤光輝'),
  ('久松博仁'),
  ('阿部勝也'),
  ('秋永芳治'),
  ('孫左近哲広'),
  ('上本直輝'),
  ('前田直毅'),
  ('深沢圭貴'),
  ('佐橋里香'),
  ('山本真季子'),
  ('青木麻莉'),
  ('佐伯信一郎'),
  ('石黒貴俊')
) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = t.v);

-- ===========================================================================
-- チーム 2チーム (佐藤チーム / 梶チーム)
-- ===========================================================================
INSERT INTO teams (name)
SELECT v
FROM (VALUES ('佐藤チーム'), ('梶チーム')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = t.v);

-- 既存メンバーで team_id 未設定の人を全員「佐藤チーム」に所属させる
UPDATE members
SET team_id = (SELECT id FROM teams WHERE name = '佐藤チーム')
WHERE team_id IS NULL;

-- 初期 visibility: 佐藤チームは梶チームも閲覧可 (非対称展開のためのシード)
-- 梶チームは自チームのみ(行登録不要)
INSERT INTO team_visibility (viewer_team_id, visible_team_id)
SELECT
  (SELECT id FROM teams WHERE name = '佐藤チーム'),
  (SELECT id FROM teams WHERE name = '梶チーム')
WHERE NOT EXISTS (
  SELECT 1 FROM team_visibility
  WHERE viewer_team_id = (SELECT id FROM teams WHERE name = '佐藤チーム')
    AND visible_team_id = (SELECT id FROM teams WHERE name = '梶チーム')
);
