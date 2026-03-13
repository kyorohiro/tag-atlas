import Database from "@tauri-apps/plugin-sql";

export const DB_FILENAME = ".tag-atlas.db";

export function joinPath(folder: string, file: string): string {
  if (folder.endsWith("/") || folder.endsWith("\\")) {
    return `${folder}${file}`;
  }
  return `${folder}/${file}`;
}

export async function ensureWorkspaceDb(rootFolder: string) {
  const dbPath = joinPath(rootFolder, DB_FILENAME);

  const db = await Database.load(`sqlite:${dbPath}`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await db.execute(`
    INSERT OR IGNORE INTO meta (key, value)
    VALUES ('schema_version', '1')
  `);

  return {
    db,
    dbPath,
  };
}
