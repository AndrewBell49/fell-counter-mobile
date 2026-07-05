import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export interface IGetBagHeightBoxPlot {
  outliersMin: number[]
  min: number
  q1: number
  medium: number
  q3: number
  max: number
  outliersMax: number[]
}

export async function getBagHeightBoxPlot(
  db: DB_TYPE,
): Promise<IGetBagHeightBoxPlot> {
  requireDb(db)

  const rows = await db.getAllAsync<{ elevation: number }>(
    `SELECT fells.elevation FROM fells
     WHERE fells.id IN (SELECT DISTINCT fell_id FROM bags)
     ORDER BY fells.elevation ASC`,
  )

  const elevations = rows.map((r) => r.elevation)

  const percentile = (arr: number[], p: number) => {
    const index = (p / 100) * (arr.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    return arr[lower] + (arr[upper] - arr[lower]) * (index - lower)
  }

  const q1 = percentile(elevations, 25)
  const median = percentile(elevations, 50)
  const q3 = percentile(elevations, 75)
  const iqr = q3 - q1
  const lowerFence = q1 - iqr * 1.5
  const upperFence = q3 + iqr * 1.5

  const inliers = elevations.filter((e) => e >= lowerFence && e <= upperFence)

  return {
    min: Math.min(...inliers),
    max: Math.max(...inliers),
    q1,
    medium: median,
    q3,
    outliersMin: elevations.filter((e) => e < lowerFence),
    outliersMax: elevations.filter((e) => e > upperFence),
  }
}
