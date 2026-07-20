import { IGetFellLocations } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

type Row = Omit<IGetFellLocations, "bagDates"> & {
  bagDates: string
}

export async function getBagLocationsByClassification(
  classificationId: number,
  db: DB_TYPE,
): Promise<IGetFellLocations[]> {
  requireDb(db)

  let rows
  if (classificationId === -1) {
    rows = await db.getAllAsync<Row>(
      `SELECT
         f.id,
         f.name,
         f.elevation,
         f.latitude,
         f.longitude,
         json_group_array(b.bag_date) AS bagDates
       FROM fells f
       JOIN bags b ON f.id = b.fell_id
       GROUP BY f.id`,
    )
  } else {
    rows = await db.getAllAsync<Row>(
      `SELECT
         f.id,
         f.name,
         f.elevation,
         f.latitude,
         f.longitude,
         json_group_array(b.bag_date) FILTER (WHERE b.bag_date IS NOT NULL) AS bagDates
     FROM fells f
     JOIN fell_classifications c ON f.id = c.fell_id
     LEFT JOIN bags b ON f.id = b.fell_id
     WHERE c.classification_id = ?
     GROUP BY f.id`,
      [classificationId],
    )
  }

  return rows.map((row) => ({
    ...row,
    bagDates: JSON.parse(row.bagDates).sort((a: number, b: number) => a - b),
  }))
}
