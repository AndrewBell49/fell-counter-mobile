import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { FellClassification } from "../schema"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999
const COLUMNS_PER_ROW = 2 // fell_id, classification_id
const MAX_ROWS_PER_CHUNK = Math.floor(SQLITE_MAX_VARIABLES / COLUMNS_PER_ROW)

export async function insertFellClassifications(
  db: DB_TYPE,
  fellClassifications: FellClassification[] | FellClassification,
) {
  requireDb(db)
  const items = Array.isArray(fellClassifications)
    ? fellClassifications
    : [fellClassifications]
  if (items.length === 0) return

  for (const chunk of chunkArray(items, MAX_ROWS_PER_CHUNK)) {
    const placeholders = chunk.map(() => `(?, ?)`).join(", ")
    const values = chunk.flatMap((fc) => [fc.fell_id, fc.classification_id])

    await db.runAsync(
      `INSERT OR REPLACE INTO fell_classifications (fell_id, classification_id)
       VALUES ${placeholders}`,
      values,
    )
  }
}
