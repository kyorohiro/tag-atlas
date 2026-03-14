import Database from "@tauri-apps/plugin-sql";

export const DB_FILENAME = ".tag-atlas.db";
export const LATEST_SCHEMA_VERSION = 1;

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
  console.log(`> ensureWorkspaceDb ${rootFolder}`);
  const dbPath = joinPath(rootFolder, DB_FILENAME);
  const db = await Database.load(`sqlite:${dbPath}`);

  await ensureMetaTable(db);
  await migrateDb(db);

  return {
    db,
    dbPath,
  };
}

async function ensureMetaTable(db: Database) {
  console.log('> ensureMetaTable');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await db.execute(`
    INSERT OR IGNORE INTO meta (key, value)
    VALUES ('schema_version', '0')
  `);
}

async function getSchemaVersion(db: Database): Promise<number> {
  const rows = await db.select<{ value: string }[]>(
    `
      SELECT value
      FROM meta
      WHERE key = 'schema_version'
    `,
  );

  if (!rows.length) {
    return 0;
  }

  const version = Number(rows[0].value);
  if (!Number.isFinite(version) || version < 0) {
    throw new Error(`Invalid schema_version: ${rows[0].value}`);
  }

  return version;
}

async function setSchemaVersion(db: Database, version: number) {
  await db.execute(
    `
      UPDATE meta
      SET value = $1
      WHERE key = 'schema_version'
    `,
    [String(version)],
  );
}

async function migrateDb(db: Database) {
  console.log('> migrateDb');
  let version = await getSchemaVersion(db);

  while (version < LATEST_SCHEMA_VERSION) {
    if (version === 0) {
      await migrate_0_to_1(db);
      version = 1;
      await setSchemaVersion(db, version);
      continue;
    }

    throw new Error(`Unsupported schema version: ${version}`);
  }
}

async function migrate_0_to_1(db: Database) {
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

export async function searchPathsByTag(db: Database, keyword: string) {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return [];
  }

  return await db.select<{ path: string; tag: string; created_at: string }[]>(
    `
      SELECT path, tag, created_at
      FROM path_tags
      WHERE tag LIKE $1
      ORDER BY path COLLATE NOCASE ASC, tag COLLATE NOCASE ASC
    `,
    [`%${normalizedKeyword}%`],
  );
}
