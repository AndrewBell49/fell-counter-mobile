import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { Classification } from "../schema"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999
const COLUMNS_PER_ROW = 3 // id, name, description
const MAX_ROWS_PER_CHUNK = Math.floor(SQLITE_MAX_VARIABLES / COLUMNS_PER_ROW)

export async function insertClassifications(
  db: DB_TYPE,
  classifications: Classification[] | Classification,
) {
  requireDb(db)
  const items = Array.isArray(classifications)
    ? classifications
    : [classifications]
  if (items.length === 0) return

  for (const chunk of chunkArray(items, MAX_ROWS_PER_CHUNK)) {
    const placeholders = chunk.map(() => `(?, ?, ?)`).join(", ")
    const values = chunk.flatMap((c) => [c.id, c.name, c.description])

    await db.runAsync(
      `INSERT OR REPLACE INTO classifications (id, name, description)
       VALUES ${placeholders}`,
      values,
    )
  }
}
