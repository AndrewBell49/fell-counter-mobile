import { db } from "../.."
import { eq, min, max, and, isNull, gte, lt } from "drizzle-orm"
import { Activity } from "../../schema/activities"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  activeActivities,
  inactiveActivities,
} from "../../schema/activeActivities"

interface GetMinMaxActivityDateParams {
  maxDate: Date
  minDate: Date
}

export async function getMinMaxActivityDate(
  userId: number,
): Promise<GetMinMaxActivityDateParams> {
  const result = await db
    .select({
      minDate: min(activeActivities.startDate),
      maxDate: max(activeActivities.startDate),
    })
    .from(activeActivities)
    .where(eq(activeActivities.userId, userId))

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
  const result = await db
    .select({
      id: activeActivities.id,
      name: activeActivities.name,
      distance: activeActivities.distance,
      elapsedTime: activeActivities.elapsedTime,
      elevation: activeActivities.elevation,
      sport: activeActivities.sport,
      movingTime: activeActivities.movingTime,
      startDate: activeActivities.startDate,
    })
    .from(activeActivities)
    .where(
      and(
        eq(activeActivities.userId, userId),
        gte(activeActivities.updatedAt, startDate),
        lt(activeActivities.updatedAt, endDate),
      ),
    )
    .orderBy(activeActivities.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)

  return result
}

export async function getAllInactiveActivities(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  const result = await db
    .select({
      id: activeActivities.id,
      name: activeActivities.name,
      distance: activeActivities.distance,
      elapsedTime: activeActivities.elapsedTime,
      elevation: activeActivities.elevation,
      sport: activeActivities.sport,
      movingTime: activeActivities.movingTime,
      startDate: activeActivities.startDate,
    })
    .from(inactiveActivities)
    .where(
      and(
        eq(inactiveActivities.userId, userId),
        gte(inactiveActivities.updatedAt, startDate),
        lt(inactiveActivities.updatedAt, endDate),
      ),
    )
    .orderBy(inactiveActivities.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)

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
        eq(activeActivities.userId, userId),
        isNull(activeActivities.checkedDate),
      ),
    )

  return result
}
