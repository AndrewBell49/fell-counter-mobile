import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999

export async function removeClassifications(
  db: DB_TYPE,
  classificationIds: number[] | number,
) {
  requireDb(db)
  const ids = Array.isArray(classificationIds)
    ? classificationIds
    : [classificationIds]
  if (ids.length === 0) return

  for (const chunk of chunkArray(ids, SQLITE_MAX_VARIABLES)) {
    const placeholders = chunk.map(() => `?`).join(", ")
    await db.runAsync(
      `DELETE FROM classifications
       WHERE id IN (${placeholders})`,
      chunk,
    )
  }
}
