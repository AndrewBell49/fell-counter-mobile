import { chunkArray } from "../chunk"
import { DB_TYPE } from "../constants"
import { PendingSync } from "../schema"
import { requireDb } from "../setup"

const SQLITE_MAX_VARIABLES = 999
const COLUMNS_PER_ROW = 3 // action, payload, created_at
const MAX_ROWS_PER_CHUNK = Math.floor(SQLITE_MAX_VARIABLES / COLUMNS_PER_ROW)

export type NewPendingSync = Omit<PendingSync, "id"> & { id?: number }

export async function insertPendingSync(
  db: DB_TYPE,
  pendingSync: NewPendingSync[] | NewPendingSync,
) {
  requireDb(db)
  const items = Array.isArray(pendingSync) ? pendingSync : [pendingSync]
  if (items.length === 0) return

  for (const chunk of chunkArray(items, MAX_ROWS_PER_CHUNK)) {
    const placeholders = chunk.map(() => `(?, ?, ?)`).join(", ")
    const values = chunk.flatMap((item) => [
      item.action,
      item.payload,
      item.created_at,
    ])

    await db.runAsync(
      `INSERT INTO pending_sync (action, payload, created_at)
       VALUES ${placeholders}`,
      values,
    )
  }
}
