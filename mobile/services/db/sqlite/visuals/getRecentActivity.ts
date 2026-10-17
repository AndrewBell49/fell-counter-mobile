import { IActivityListItem } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getRecentActivity(
  db: DB_TYPE,
): Promise<IActivityListItem | null> {
  requireDb(db)

  const query = `
    SELECT 
      a.id,
      a.name AS title,
      COALESCE(a.distance, 0) AS distance,
      COALESCE(a.elapsed_time, 0) AS elapsedTime,
      COALESCE(a.moving_time, 0) AS movingTime,
      COALESCE(a.elevation, 0) AS elevationGain,
      COALESCE(a.sport, 'run') AS sport,
      a.start_date AS startDate,
      COUNT(b.id) AS fellsCount,
      a.summary_polyline AS summaryPolyline
    FROM activities a
    LEFT JOIN bags b ON a.id = b.activity_id
    GROUP BY a.id
    HAVING COUNT(b.id) > 0
    ORDER BY a.start_date DESC
    LIMIT 1
  `
  const results = await db.getAllAsync<IActivityListItem>(query)

  if (results.length === 0) {
    return null
  }
  return results[0]
}
