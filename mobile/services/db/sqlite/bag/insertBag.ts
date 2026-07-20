import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { Bag } from "../schema"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999
const COLUMNS_PER_ROW = 4 // id, fell_id, activity_id, bag_date
const MAX_ROWS_PER_CHUNK = Math.floor(SQLITE_MAX_VARIABLES / COLUMNS_PER_ROW)

export async function insertBags(db: DB_TYPE, bags: Bag[] | Bag) {
  requireDb(db)
  const items = Array.isArray(bags) ? bags : [bags]
  if (items.length === 0) return

  for (const chunk of chunkArray(items, MAX_ROWS_PER_CHUNK)) {
    const placeholders = chunk.map(() => `(?, ?, ?, ?)`).join(", ")
    const values = chunk.flatMap((b) => [
      b.id,
      b.fell_id,
      b.activity_id,
      b.bag_date,
    ])

    await db.runAsync(
      `INSERT OR REPLACE INTO bags (id, fell_id, activity_id, bag_date)
       VALUES ${placeholders}`,
      values,
    )
  }
}
