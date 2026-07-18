import { IGetMaxMinBagDate } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getMaxMinBagDate(
  db: DB_TYPE,
): Promise<IGetMaxMinBagDate> {
  requireDb(db)

  const row = await db.getFirstAsync<IGetMaxMinBagDate>(
    `SELECT MAX(bag_date) AS max, MIN(bag_date) AS min
     FROM bags`,
  )

  return row || { max: new Date().getTime(), min: 0 }
}
