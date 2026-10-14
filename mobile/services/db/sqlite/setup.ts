import * as SQLite from "expo-sqlite"
import type { DB_TYPE } from "./constants"
import { DB_NAME } from "./constants"

export async function setupDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME)

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS fells (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      elevation REAL NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      country TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classifications (
      id INTEGER NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fell_classifications (
      fell_id INTEGER NOT NULL REFERENCES fells(id),
      classification_id INTEGER NOT NULL REFERENCES classifications(id),
      PRIMARY KEY (fell_id, classification_id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      distance REAL,
      elapsed_time INTEGER,
      moving_time INTEGER,
      elevation REAL,
      sport TEXT,
      start_date INTEGER NOT NULL,
      average_speed: REAL,
      max_speed: REAL,
      summary_polyline: TEXT
    );

    CREATE TABLE IF NOT EXISTS bags (
      id INTEGER NOT NULL PRIMARY KEY,
      fell_id INTEGER NOT NULL REFERENCES fells(id),
      activity_id INTEGER NOT NULL REFERENCES activities(id),
      bag_date INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    `)

  return db
}

export function requireDb(db: DB_TYPE): asserts db is NonNullable<DB_TYPE> {
  if (!db) throw new Error("Database not initialised")
}

export async function resetDatabase(): Promise<void> {
  await SQLite.deleteDatabaseAsync(DB_NAME)
  console.log("Reset Database")
}
