import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999

export async function removeFells(db: DB_TYPE, fellIds: number[] | number) {
  requireDb(db)
  const ids = Array.isArray(fellIds) ? fellIds : [fellIds]
  if (ids.length === 0) return

  for (const chunk of chunkArray(ids, SQLITE_MAX_VARIABLES)) {
    const placeholders = chunk.map(() => `?`).join(", ")
    await db.runAsync(`DELETE FROM fells WHERE id IN (${placeholders})`, chunk)
  }
}
