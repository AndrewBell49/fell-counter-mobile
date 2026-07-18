import { IGetBagsInDateOrder } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

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

  return fillMissingRows(rows)
}

function fillMissingRows(rows: IGetBagsInDateOrder[]): IGetBagsInDateOrder[] {
  if (rows.length === 0) return []
  const existing = new Map<number, IGetBagsInDateOrder>()
  for (const row of rows) {
    existing.set(monthKey(row.month), row)
  }

  const startKey = monthKey(rows[0].month)
  const endKey = monthKey(rows[rows.length - 1].month)

  const filled: IGetBagsInDateOrder[] = []
  for (let key = startKey; key <= endKey; key++) {
    const found = existing.get(key)
    filled.push(found ?? { month: keyToMonthStr(key), bags: 0 })
  }

  return filled
}

/** Converts "MM/YY" to a single sortable integer: year * 12 + month. */
function monthKey(dt: string): number {
  const [monthStr, yearStr] = dt.split("/")
  return Number(yearStr) * 12 + Number(monthStr)
}

/** Converts a monthKey back to "MM/YY", zero-padded. */
function keyToMonthStr(key: number): string {
  const year = Math.floor(key / 12)
  const month = key % 12 === 0 ? 12 : key % 12
  const adjustedYear = key % 12 === 0 ? year - 1 : year
  return `${String(month).padStart(2, "0")}/${String(adjustedYear).padStart(2, "0")}`
}
