// Name of the team whose view is served at the root ("/") URL.
// Historically the app launched with 佐藤チーム, and existing bookmarks to
// "/" belong to that team, so we keep them working.
//
// If the team is renamed in the future, either update this constant or
// promote it to a DB flag (teams.is_default). Kept in one place so the
// swap is a single edit.
export const DEFAULT_TEAM_NAME = '佐藤チーム';
