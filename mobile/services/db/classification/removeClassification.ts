import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removeClassifications(
  db: DB_TYPE,
  classificationIds: number[] | number,
) {
  requireDb(db)
  const ids = Array.isArray(classificationIds)
    ? classificationIds
    : [classificationIds]
  if (ids.length === 0) return

  const placeholders = ids.map(() => `?`).join(", ")

  await db.runAsync(
    `DELETE FROM classifications
     WHERE id IN (${placeholders})`,
    ids,
  )
}
