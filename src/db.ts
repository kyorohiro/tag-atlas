import Database from "@tauri-apps/plugin-sql";

export const DB_FILENAME = ".tag-atlas.db";

export function joinPath(folder: string, file: string): string {
  if (folder.endsWith("/") || folder.endsWith("\\")) {
    return `${folder}${file}`;
  }
  return `${folder}/${file}`;
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS path_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      tag TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(path, tag)
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_path_tags_path
    ON path_tags(path)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_path_tags_tag
    ON path_tags(tag)
  `);

  return {
    db,
    dbPath,
  };
}

export async function addTagToPath(
  db: Database,
  path: string,
  tag: string,
) {
  const normalizedPath = normalizePath(path).trim();
  const normalizedTag = tag.trim();

  if (!normalizedPath) {
    throw new Error("path is empty");
  }
  if (!normalizedTag) {
    throw new Error("tag is empty");
  }

  await db.execute(
    `
      INSERT OR IGNORE INTO path_tags (path, tag)
      VALUES ($1, $2)
    `,
    [normalizedPath, normalizedTag],
  );
}

export async function getTagsByPath(db: Database, path: string) {
  const normalizedPath = normalizePath(path).trim();

  return await db.select<{ tag: string; created_at: string }[]>(
    `
      SELECT tag, created_at
      FROM path_tags
      WHERE path = $1
      ORDER BY tag COLLATE NOCASE ASC
    `,
    [normalizedPath],
  );
}

export async function getPathsByTag(db: Database, tag: string) {
  const normalizedTag = tag.trim();

  return await db.select<{ path: string; created_at: string }[]>(
    `
      SELECT path, created_at
      FROM path_tags
      WHERE tag = $1
      ORDER BY path COLLATE NOCASE ASC
    `,
    [normalizedTag],
  );
}

export async function removeTagFromPath(
  db: Database,
  path: string,
  tag: string,
) {
  const normalizedPath = normalizePath(path).trim();
  const normalizedTag = tag.trim();

  await db.execute(
    `
      DELETE FROM path_tags
      WHERE path = $1 AND tag = $2
    `,
    [normalizedPath, normalizedTag],
  );
}