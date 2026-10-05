import { IGetFellInfo } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getFellInfo(
  fellId: number,
  db: DB_TYPE,
): Promise<IGetFellInfo | undefined> {
  requireDb(db)

  const [fell, bagRows, classificationRows] = await Promise.all([
    db.getFirstAsync<{
      name: string
      elevation: number
      latitude: number
      longitude: number
    }>(`SELECT name, elevation, latitude, longitude FROM fells WHERE id = ?`, [
      fellId,
    ]),

    db.getAllAsync<{
      bag_date: number
      activity_name: string
      activity_id: number
      sport: string
    }>(
      `SELECT MAX(b.bag_date) AS bag_date, a.name AS activity_name, a.id AS activity_id, a.sport
       FROM bags b
       INNER JOIN activities a ON b.activity_id = a.id
       WHERE b.fell_id = ?
       GROUP BY a.id
       ORDER BY bag_date DESC`,
      [fellId],
    ),

    db.getAllAsync<{ name: string; description: string }>(
      `SELECT c.name, c.description
     FROM classifications c
     INNER JOIN fell_classifications fc ON c.id = fc.classification_id
     WHERE fc.fell_id = ?`,
      [fellId],
    ),
  ])

  if (!fell) {
    throw new Error(`Fell with id ${fellId} not found`)
  }

  return {
    name: fell.name,
    elevation: fell.elevation,
    latitude: fell.latitude,
    longitude: fell.longitude,
    bags: bagRows.map((row) => ({
      date: row.bag_date,
      activityName: row.activity_name,
      activityId: row.activity_id,
      sport: row.sport,
    })),
    classifications: classificationRows.map((row) => ({
      name: row.name,
      description: row.description,
    })),
  }
}
