import { IGetActivityDistanceInDateOrder } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"
import { fillMissingRows } from "./fillMissingRows"

export async function getActivityDistanceInDateOrder(
  sport: string,
  db: DB_TYPE,
): Promise<IGetActivityDistanceInDateOrder[]> {
  requireDb(db)

  const rows = await db.getAllAsync<IGetActivityDistanceInDateOrder>(
    `SELECT 
       ROUND(SUM(distance)/1000) AS kms,
       strftime('%m/%g', datetime(start_date / 1000, 'unixepoch')) AS month
     FROM activities
     WHERE sport = ?
     GROUP BY strftime('%m/%g', datetime(start_date / 1000, 'unixepoch'))
     ORDER BY start_date`,
    [sport],
  )

  return fillMissingRows(rows, "month", (month) => ({ month, kms: 0 }))
}
