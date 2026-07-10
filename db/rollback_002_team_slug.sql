-- Phase 2 (URL別チーム) を撤回する rollback SQL
-- teams.slug 列とユニークインデックスを削除。既存の slug 値は失われる。

BEGIN;

DROP INDEX IF EXISTS teams_slug_unique;
ALTER TABLE teams DROP COLUMN IF EXISTS slug;

COMMIT;
