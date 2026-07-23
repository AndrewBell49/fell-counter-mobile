import { IGetBagsInDateOrder } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"
import { fillMissingRows } from "./fillMissingRows"

export async function getBagsInDateOrder(
  db: DB_TYPE,
): Promise<IGetBagsInDateOrder[]> {
  requireDb(db)

  const rows = await db.getAllAsync<IGetBagsInDateOrder>(
    `SELECT 
       COUNT(*) AS bags,
       strftime('%m/%g', datetime(bag_date / 1000, 'unixepoch')) AS month
     FROM bags
     GROUP BY strftime('%m/%g', datetime(bag_date / 1000, 'unixepoch'))
     ORDER BY bag_date`,
  )

  return fillMissingRows(rows, "month", (month) => ({ month, bags: 0 }))
}
