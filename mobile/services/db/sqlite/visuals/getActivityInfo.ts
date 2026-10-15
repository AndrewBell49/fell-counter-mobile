import { IGetActivityInfo } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getActivityInfo(
  activityId: number,
  db: DB_TYPE,
): Promise<IGetActivityInfo | undefined> {
  requireDb(db)

  const [activity, bagRows] = await Promise.all([
    // 1. Fetch activity metrics
    db.getFirstAsync<{
      id: number
      title: string
      description: string
      sport: string
      distance: number
      moving_time: number
      elapsed_time: number
      elevation_gain: number
      start_date: number
      average_speed: number
      max_speed: number
      summary_polyline: string
    }>(
      `SELECT id, name AS title, description, sport, distance, moving_time, elapsed_time, elevation AS elevation_gain, start_date, average_speed, max_speed, summary_polyline
       FROM activities 
       WHERE id = ?`,
      [activityId],
    ),

    // 2. Fetch all bags for this activity with fell details
    db.getAllAsync<{
      bag_id: number
      fell_id: number
      fell_name: string
      elevation: number
      latitude: number
      longitude: number
    }>(
      `SELECT b.id AS bag_id, f.id AS fell_id, f.name AS fell_name, f.elevation, f.latitude, f.longitude
       FROM bags b
       INNER JOIN fells f ON b.fell_id = f.id
       WHERE b.activity_id = ?
       ORDER BY b.bag_date ASC`,
      [activityId],
    ),
  ])

  if (!activity) {
    return
  }

  // Track bag occurrence count per fell (1st, 2nd, 3rd time on this activity)
  const fellCounts: Record<number, number> = {}

  const baggedFells = bagRows.map((row) => {
    fellCounts[row.fell_id] = (fellCounts[row.fell_id] || 0) + 1

    return {
      bagId: row.bag_id,
      fellId: row.fell_id,
      fellName: row.fell_name,
      elevation: row.elevation,
      latitude: row.latitude,
      longitude: row.longitude,
      bagOccurrence: fellCounts[row.fell_id],
    }
  })

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    sport: activity.sport,
    distance: activity.distance,
    movingTime: activity.moving_time,
    elapsedTime: activity.elapsed_time,
    elevationGain: activity.elevation_gain,
    startDate: activity.start_date,
    averageSpeed: activity.average_speed,
    maxSpeed: activity.max_speed,
    summaryPolyline: activity.summary_polyline,
    baggedFells,
  }
}
