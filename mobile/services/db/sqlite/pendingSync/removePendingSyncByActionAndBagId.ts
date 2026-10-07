import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removePendingSyncByActionAndBagId(
  db: DB_TYPE,
  action: "ADD_BAG" | "REMOVE_BAG",
  bagId: number,
): Promise<void> {
  requireDb(db)

  await db.runAsync(
    `DELETE FROM pending_sync WHERE action = ? AND JSON_EXTRACT(payload, '$.bagId') = ?`,
    [action, bagId],
  )
}
