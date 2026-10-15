import { IActivityListItem, IGetActivitiesParams } from "../../types"
import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"

export async function getActivities(
  db: DB_TYPE,
  {
    page = 1,
    limit = 15,
    sortBy = "startDate",
    sortOrder = "DESC",
    search,
    sport,
    minDate,
    maxDate,
    minDistance,
    maxDistance,
    minElevation,
    maxElevation,
    minTime,
    maxTime,
    minFells,
    maxFells,
  }: IGetActivitiesParams = {},
): Promise<IActivityListItem[]> {
  requireDb(db)

  const offset = (page - 1) * limit
  const whereClauses: string[] = []
  const havingClauses: string[] = []
  const params: (string | number)[] = []

  // Dynamic WHERE filters

  if (search && search.trim()) {
    whereClauses.push("a.name LIKE ?")
    params.push(`%${search.trim()}%`)

    // Note: If you also have a description or notes column in `activities`,
    // you can use this instead:
    // whereClauses.push("(a.name LIKE ? OR a.notes LIKE ?)")
    // const term = `%${search.trim()}%`
    // params.push(term, term)
  }

  if (sport) {
    if (Array.isArray(sport) && sport.length > 0) {
      const placeholders = sport.map(() => "LOWER(?)").join(", ")
      whereClauses.push(`LOWER(a.sport) IN (${placeholders})`)
      params.push(...sport)
    } else if (typeof sport === "string") {
      whereClauses.push("LOWER(a.sport) = LOWER(?)")
      params.push(sport)
    }
  }
  if (minDate !== undefined) {
    whereClauses.push("a.start_date >= ?")
    params.push(minDate)
  }
  if (maxDate !== undefined) {
    whereClauses.push("a.start_date <= ?")
    params.push(maxDate)
  }
  if (minDistance !== undefined) {
    whereClauses.push("a.distance >= ?")
    params.push(minDistance)
  }
  if (maxDistance !== undefined) {
    whereClauses.push("a.distance <= ?")
    params.push(maxDistance)
  }
  if (minElevation !== undefined) {
    whereClauses.push("a.elevation >= ?")
    params.push(minElevation)
  }
  if (maxElevation !== undefined) {
    whereClauses.push("a.elevation <= ?")
    params.push(maxElevation)
  }
  if (minTime !== undefined) {
    whereClauses.push("a.moving_time >= ?")
    params.push(minTime)
  }
  if (maxTime !== undefined) {
    whereClauses.push("a.moving_time <= ?")
    params.push(maxTime)
  }

  // Dynamic HAVING filters (Aggregate fellsCount)
  if (minFells !== undefined) {
    havingClauses.push("COUNT(b.id) >= ?")
    params.push(minFells)
  }
  if (maxFells !== undefined) {
    havingClauses.push("COUNT(b.id) <= ?")
    params.push(maxFells)
  }

  const sortColumnMap: Record<string, string> = {
    startDate: "a.start_date",
    distance: "a.distance",
    elevationGain: "a.elevation",
    movingTime: "a.moving_time",
    sport: "a.sport",
    fellsCount: "fellsCount",
  }

  const orderByColumn = sortColumnMap[sortBy] ?? "a.start_date"
  const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""
  const havingSql =
    havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : ""

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
    ${whereSql}
    GROUP BY a.id
    ${havingSql}
    ORDER BY ${orderByColumn} ${safeOrder}
    LIMIT ? OFFSET ?
  `

  params.push(limit, offset)

  const results = await db.getAllAsync<IActivityListItem>(query, params)
  return results
}
