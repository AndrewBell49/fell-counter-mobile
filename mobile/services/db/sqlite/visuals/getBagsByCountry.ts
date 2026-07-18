import { IGetCountryBag } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getBagsByCountry(db: DB_TYPE): Promise<IGetCountryBag[]> {
  requireDb(db)

  const rows = await db.getAllAsync<IGetCountryBag>(
    `SELECT COUNT(DISTINCT bags.fell_id) as count, country
     FROM bags
     LEFT JOIN fells
     ON bags.fell_id = fells.id
     GROUP BY country`,
  )

  return rows
}
