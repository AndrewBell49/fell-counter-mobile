import { DB_TYPE } from "../constants"
import { Bag } from "../schema"
import { requireDb } from "../setup"

export async function selectBagById(
  db: DB_TYPE,
  bagId: number,
): Promise<Bag | null> {
  requireDb(db)

  const row = await db.getFirstAsync<Bag>(
    "SELECT * FROM bags WHERE id = ?",
    [bagId],
  )

  return row || null
}
