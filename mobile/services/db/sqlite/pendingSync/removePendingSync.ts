import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removePendingSyncByIds(
  db: DB_TYPE,
  ids: number[],
): Promise<void> {
  requireDb(db)
  if (ids.length === 0) return

  const placeholders = ids.map(() => "?").join(", ")
  await db.runAsync(
    `DELETE FROM pending_sync WHERE id IN (${placeholders})`,
    ids,
  )
}
