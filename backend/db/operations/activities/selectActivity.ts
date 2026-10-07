import { db } from "../.."
import { eq, min, max, and, isNull, gte, gt, lt } from "drizzle-orm"
import {
  activeActivities,
  inactiveActivities,
  Activity,
} from "../../schema/activities"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"

interface GetMinMaxActivityDateParams {
  maxDate: Date
  minDate: Date
}

export async function getMinMaxActivityDate(
  userId: number,
): Promise<GetMinMaxActivityDateParams> {
  const result = await db
    .select({
      minDate: min(activeActivities.start_date),
      maxDate: max(activeActivities.start_date),
    })
    .from(activeActivities)
    .where(eq(activeActivities.user_id, userId))

  // default to the most extreme, if no activities found
  if (result.length == 0) {
    return { minDate: new Date(), maxDate: new Date(0) }
  }

  return {
    minDate: result[0].minDate || new Date(),
    maxDate: result[0].maxDate || new Date(0),
  }
}

export async function getAllActiveActivities(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .select({
      id: activeActivities.id,
      name: activeActivities.name,
      distance: activeActivities.distance,
      elapsed_time: activeActivities.elapsed_time,
      elevation: activeActivities.elevation,
      sport: activeActivities.sport,
      moving_time: activeActivities.moving_time,
      start_date: activeActivities.start_date,
    })
    .from(activeActivities)
    .where(
      and(
        eq(activeActivities.user_id, userId),
        eq(activeActivities.active, true),
        gte(activeActivities.updated_at, startDate),
        lt(activeActivities.updated_at, endDate),
        page ? gt(activeActivities.id, page) : undefined,
      ),
    )
    .orderBy(activeActivities.id)
    .limit(ROW_RETURN_LIMIT)
}

export async function getAllInactiveActivities(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  const result = await db
    .select({
      id: inactiveActivities.id,
      name: inactiveActivities.name,
      distance: inactiveActivities.distance,
      elapsed_time: inactiveActivities.elapsed_time,
      elevation: inactiveActivities.elevation,
      sport: inactiveActivities.sport,
      moving_time: inactiveActivities.moving_time,
      start_date: inactiveActivities.start_date,
    })
    .from(inactiveActivities)
    .where(
      and(
        eq(inactiveActivities.user_id, userId),
        gte(inactiveActivities.updated_at, startDate),
        lt(inactiveActivities.updated_at, endDate),
        page ? gt(inactiveActivities.id, page) : undefined,
      ),
    )
    .orderBy(inactiveActivities.id)
    .limit(ROW_RETURN_LIMIT)

  return result
}

export async function getAllUncheckedActivities(
  userId: number,
): Promise<Activity[]> {
  const result = await db
    .select()
    .from(activeActivities)
    .where(
      and(
        eq(activeActivities.user_id, userId),
        isNull(activeActivities.checked_date),
      ),
    )

  return result
}
