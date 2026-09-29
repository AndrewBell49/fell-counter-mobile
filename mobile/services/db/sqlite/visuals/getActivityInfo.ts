import { SQLiteDatabase } from "expo-sqlite"
import { IGetActivityInfo } from "../../types"

export async function getActivityInfo(
  activityId: number,
  db: SQLiteDatabase,
): Promise<IGetActivityInfo | undefined> {
  const [activity, bagRows] = await Promise.all([
    // 1. Fetch activity metrics
    db.getFirstAsync<{
      id: number
      title: string
      sport: string
      distance: number
      moving_time: number
      elapsed_time: number
      elevation_gain: number
      start_date: number
    }>(
      `SELECT id, name AS title, sport, distance, moving_time, elapsed_time, elevation AS elevation_gain, start_date 
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
    }>(
      `SELECT b.id AS bag_id, f.id AS fell_id, f.name AS fell_name, f.elevation
       FROM bags b
       INNER JOIN fells f ON b.fell_id = f.id
       WHERE b.activity_id = ?
       ORDER BY b.id ASC`,
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
      bagOccurrence: fellCounts[row.fell_id],
    }
  })

  return {
    id: activity.id,
    title: activity.title,
    sport: activity.sport,
    distance: activity.distance,
    movingTime: activity.moving_time,
    elapsedTime: activity.elapsed_time,
    elevationGain: activity.elevation_gain,
    startDate: activity.start_date,
    baggedFells,
  }
}
