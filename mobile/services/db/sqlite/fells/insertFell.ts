import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { Fell } from "../schema"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999
const COLUMNS_PER_ROW = 6 // id, name, elevation, latitude, longitude, country
const MAX_ROWS_PER_CHUNK = Math.floor(SQLITE_MAX_VARIABLES / COLUMNS_PER_ROW)

export async function insertFells(db: DB_TYPE, fells: Fell[] | Fell) {
  requireDb(db)
  const items = Array.isArray(fells) ? fells : [fells]
  if (items.length === 0) return

  for (const chunk of chunkArray(items, MAX_ROWS_PER_CHUNK)) {
    const placeholders = chunk.map(() => `(?, ?, ?, ?, ?, ?)`).join(", ")
    const values = chunk.flatMap((f) => [
      f.id,
      f.name,
      f.elevation,
      f.latitude,
      f.longitude,
      f.country,
    ])

    await db.runAsync(
      `INSERT OR REPLACE INTO fells (id, name, elevation, latitude, longitude, country)
       VALUES ${placeholders}`,
      values,
    )
  }
}
