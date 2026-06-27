import { DB_TYPE } from "../constants"
import { Fell } from "../schema"
import { requireDb } from "../setup"

export async function insertFells(db: DB_TYPE, fells: Fell[] | Fell) {
  requireDb(db)
  const items = Array.isArray(fells) ? fells : [fells]
  if (items.length === 0) return

  const placeholders = items.map(() => `(?, ?, ?, ?, ?, ?)`).join(", ")
  const values = items.flatMap((f) => [
    f.id,
    f.name,
    f.elevation,
    f.latitude,
    f.longitude,
    f.country,
  ])

  await db.runAsync(
    `INSERT OR REPLACE INTO fells (id, name, elevation, latitude, longitude, country)
     VALUES ${placeholders}`,
    values,
  )
}
