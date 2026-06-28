-- Phase 1 のチーム機能を撤回する rollback SQL
-- ⚠️ 実行すると members.team_id 列と teams / team_visibility テーブルが消えます
-- アプリ側のコードも Phase 1 以前にロールバックしてから適用してください

BEGIN;

ALTER TABLE members DROP COLUMN IF EXISTS team_id;
DROP TABLE IF EXISTS team_visibility;
DROP TABLE IF EXISTS teams;

COMMIT;
