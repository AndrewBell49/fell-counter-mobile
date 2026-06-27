import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removeActivities(
  db: DB_TYPE,
  activityIds: number[] | number,
) {
  requireDb(db)
  const ids = Array.isArray(activityIds) ? activityIds : [activityIds]
  if (ids.length === 0) return

  const placeholders = ids.map(() => `?`).join(", ")

  await db.runAsync(`DELETE FROM activities WHERE id IN (${placeholders})`, ids)
}
