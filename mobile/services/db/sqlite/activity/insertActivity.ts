import { DB_TYPE } from "../constants"
import { Activity } from "../schema"
import { requireDb } from "../setup"

export async function insertActivities(
  db: DB_TYPE,
  activities: Activity[] | Activity,
) {
  requireDb(db)
  const items = Array.isArray(activities) ? activities : [activities]
  if (items.length === 0) return

  const placeholders = items
    .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .join(", ")
  const values = items.flatMap((a) => [
    a.id,
    a.name,
    a.description,
    a.distance,
    a.elapsed_time,
    a.moving_time,
    a.elevation,
    a.sport,
    a.start_date,
    a.average_speed,
    a.max_speed,
    a.summary_polyline,
  ])

  await db.runAsync(
    `INSERT OR REPLACE INTO activities (id, name, description, distance, elapsed_time, moving_time, elevation, sport, start_date, average_speed, max_speed, summary_polyline)
     VALUES ${placeholders}`,
    values,
  )
}
