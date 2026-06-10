-- オシミセ 初期メンバー13名
-- 冪等: 同名メンバーが既にあれば追加しない

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
