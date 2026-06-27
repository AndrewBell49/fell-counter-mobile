import { eq, and, gte, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  activeFellClassifications,
  inactiveFellClassifications,
} from "../../schema/fellClassifications"
import { bags } from "../../schema/bags"

export async function getAllActiveFellClassifications(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .selectDistinct({
      fell_id: activeFellClassifications.fell_id,
      classification_id: activeFellClassifications.classification_id,
    })
    .from(activeFellClassifications)
    .innerJoin(bags, eq(activeFellClassifications.fell_id, bags.fell_id))
    .where(
      and(
        gte(activeFellClassifications.updated_at, startDate),
        lt(activeFellClassifications.updated_at, endDate),
        eq(bags.user_id, userId),
      ),
    )
    .orderBy(
      activeFellClassifications.fell_id,
      activeFellClassifications.classification_id,
    )
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}

export async function getAllInactiveFellClassifications(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .selectDistinct({
      fell_id: inactiveFellClassifications.fell_id,
      classification_id: inactiveFellClassifications.classification_id,
    })
    .from(inactiveFellClassifications)
    .innerJoin(bags, eq(inactiveFellClassifications.fell_id, bags.fell_id))
    .where(
      and(
        gte(inactiveFellClassifications.updated_at, startDate),
        lt(inactiveFellClassifications.updated_at, endDate),
        eq(bags.user_id, userId),
      ),
    )
    .orderBy(
      inactiveFellClassifications.fell_id,
      inactiveFellClassifications.classification_id,
    )
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}
