import { DB_TYPE } from "../constants"
import { PendingSync } from "../schema"
import { requireDb } from "../setup"

export async function selectPendingSync(db: DB_TYPE): Promise<PendingSync[]> {
  requireDb(db)
  return await db.getAllAsync<PendingSync>(
    `SELECT id, action, payload, created_at FROM pending_sync ORDER BY created_at ASC`,
  )
}
