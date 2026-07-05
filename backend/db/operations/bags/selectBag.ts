import { eq, and, gte, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import { activeBags, inactiveBags } from "../../schema/bags"

export async function getAllActiveBags(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .select({
      id: activeBags.id,
      activity_id: activeBags.activity_id,
      bag_date: activeBags.bag_date,
      fell_id: activeBags.fell_id,
    })
    .from(activeBags)
    .where(
      and(
        eq(activeBags.user_id, userId),
        gte(activeBags.updated_at, startDate),
        lt(activeBags.updated_at, endDate),
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
      id: inactiveBags.id,
      activity_id: inactiveBags.activity_id,
      bag_date: inactiveBags.bag_date,
      fell_id: inactiveBags.fell_id,
    })
    .from(inactiveBags)
    .where(
      and(
        eq(inactiveBags.user_id, userId),
        gte(inactiveBags.updated_at, startDate),
        lt(inactiveBags.updated_at, endDate),
      ),
    )
    .orderBy(inactiveBags.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}
