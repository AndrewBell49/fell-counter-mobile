import { IGetPopularFells } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getPopularFells(
  db: DB_TYPE,
  count: number,
): Promise<IGetPopularFells[]> {
  requireDb(db)

  const rows = await db.getAllAsync<IGetPopularFells>(
    `SELECT fells.id, fells.name, fells.elevation, COUNT(*) as count
     FROM bags
     LEFT JOIN fells
     ON bags.fell_id = fells.id
     GROUP BY bags.fell_id
     ORDER BY count DESC, fells.elevation DESC, fells.name ASC
     LIMIT ?`,
    [count],
  )

  return rows
}
