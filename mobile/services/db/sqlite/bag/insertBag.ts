import { DB_TYPE } from "../constants"
import { Bag } from "../schema"
import { requireDb } from "../setup"

export async function insertBags(db: DB_TYPE, bags: Bag[] | Bag) {
  requireDb(db)
  const items = Array.isArray(bags) ? bags : [bags]
  if (items.length === 0) return

  const placeholders = items.map(() => `(?, ?, ?, ?)`).join(", ")
  const values = items.flatMap((b) => [
    b.id,
    b.fell_id,
    b.activity_id,
    b.bag_date,
  ])

  await db.runAsync(
    `INSERT OR REPLACE INTO bags (id, fell_id, activity_id, bag_date)
     VALUES ${placeholders}`,
    values,
  )
}
