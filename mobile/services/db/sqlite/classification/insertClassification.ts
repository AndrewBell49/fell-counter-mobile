import { DB_TYPE } from "../constants"
import { Classification } from "../schema"
import { requireDb } from "../setup"

export async function insertClassifications(
  db: DB_TYPE,
  classifications: Classification[] | Classification,
) {
  requireDb(db)
  const items = Array.isArray(classifications)
    ? classifications
    : [classifications]
  if (items.length === 0) return

  const placeholders = items.map(() => `(?, ?, ?)`).join(", ")
  const values = items.flatMap((c) => [c.id, c.name, c.description])

  await db.runAsync(
    `INSERT OR REPLACE INTO classifications (id, name, description)
     VALUES ${placeholders}`,
    values,
  )
}
