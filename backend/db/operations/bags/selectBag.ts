import { eq, and, gte, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import { activeBags, inactiveBags } from "../../schema/activeBags"

export async function getAllActiveBags(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .select({
      id: activeBags.id,
      activityId: activeBags.activityId,
      bagDate: activeBags.bagDate,
      fellId: activeBags.fellId,
    })
    .from(activeBags)
    .where(
      and(
        eq(activeBags.userId, userId),
        gte(activeBags.updatedAt, startDate),
        lt(activeBags.updatedAt, endDate),
      ),
    )
    .orderBy(activeBags.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}

export async function getAllInactiveBags(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .select({
      id: activeBags.id,
      activityId: activeBags.activityId,
      bagDate: activeBags.bagDate,
      fellId: activeBags.fellId,
    })
    .from(inactiveBags)
    .where(
      and(
        eq(inactiveBags.userId, userId),
        gte(inactiveBags.updatedAt, startDate),
        lt(inactiveBags.updatedAt, endDate),
      ),
    )
    .orderBy(inactiveBags.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}
