import { IGetSportCount } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getSportCounts(db: DB_TYPE): Promise<IGetSportCount[]> {
  requireDb(db)

  const rows = await db.getAllAsync<IGetSportCount>(
    `SELECT sport, COUNT(*) as count
     FROM activities
     GROUP BY sport
     ORDER BY count DESC`,
  )

  return rows
}
