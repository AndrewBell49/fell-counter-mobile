import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function removeOrphanedFells(db: DB_TYPE): Promise<void> {
  requireDb(db)

  await db.runAsync(
    `DELETE FROM fells
     WHERE id NOT IN (SELECT DISTINCT fell_id FROM fell_classifications)
       AND id NOT IN (SELECT DISTINCT fell_id FROM bags)`,
  )
}
