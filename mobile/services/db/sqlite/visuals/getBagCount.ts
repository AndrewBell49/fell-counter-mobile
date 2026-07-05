import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export interface IGetBagCount {
  count: number
  distinct: number
}

export async function getBagCount(db: DB_TYPE): Promise<IGetBagCount> {
  requireDb(db)
  const result = await db.getFirstAsync<IGetBagCount>(
    `SELECT COUNT(*) AS count, COUNT(DISTINCT fell_id) AS distinct FROM bags`,
  )
  return { count: result?.count ?? 0, distinct: result?.distinct ?? 0 }
}
