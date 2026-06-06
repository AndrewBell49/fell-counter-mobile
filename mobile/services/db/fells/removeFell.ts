import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removeFells(db: DB_TYPE, fellIds: number[] | number) {
  requireDb(db)
  const ids = Array.isArray(fellIds) ? fellIds : [fellIds]
  if (ids.length === 0) return

  const placeholders = ids.map(() => `?`).join(", ")

  await db.runAsync(`DELETE FROM fells WHERE id IN (${placeholders})`, ids)
}
