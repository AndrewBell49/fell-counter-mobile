import { IGetBagCount } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getBagCount(db: DB_TYPE): Promise<IGetBagCount> {
  requireDb(db)
  const result = await db.getFirstAsync<IGetBagCount>(
    `SELECT COUNT(*) AS count, COUNT(DISTINCT fell_id) AS distinctCount FROM bags`,
  )
  return {
    count: result?.count ?? 0,
    distinctCount: result?.distinctCount ?? 0,
  }
}
