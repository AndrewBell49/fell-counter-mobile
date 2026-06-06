import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removeBags(db: DB_TYPE, bagIds: number[] | number) {
  requireDb(db)
  const ids = Array.isArray(bagIds) ? bagIds : [bagIds]
  if (ids.length === 0) return

  const placeholders = ids.map(() => `?`).join(", ")

  await db.runAsync(`DELETE FROM bags WHERE id IN (${placeholders})`, ids)
}
