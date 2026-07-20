import { DB_TYPE } from "../constants"
import { Classification } from "../schema"
import { requireDb } from "../setup"

export async function getAllClassifications(
  db: DB_TYPE,
): Promise<Classification[]> {
  requireDb(db)

  const rows = await db.getAllAsync<Classification>(
    `SELECT *
     FROM classifications`,
  )

  return rows
}
