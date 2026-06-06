import { eq, and, gte, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  activeFellClassifications,
  inactiveFellClassifications,
} from "../../schema/activeFellClassifications"
import { bags } from "../../schema/bags"

export async function getAllActiveFellClassifications(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .selectDistinct({
      fellId: activeFellClassifications.fellId,
      classificationId: activeFellClassifications.classificationId,
    })
    .from(activeFellClassifications)
    .innerJoin(bags, eq(activeFellClassifications.fellId, bags.fellId))
    .where(
      and(
        gte(activeFellClassifications.updatedAt, startDate),
        lt(activeFellClassifications.updatedAt, endDate),
        eq(bags.userId, userId),
      ),
    )
    .orderBy(
      activeFellClassifications.fellId,
      activeFellClassifications.classificationId,
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
      fellId: inactiveFellClassifications.fellId,
      classificationId: inactiveFellClassifications.classificationId,
    })
    .from(inactiveFellClassifications)
    .innerJoin(bags, eq(inactiveFellClassifications.fellId, bags.fellId))
    .where(
      and(
        gte(inactiveFellClassifications.updatedAt, startDate),
        lt(inactiveFellClassifications.updatedAt, endDate),
        eq(bags.userId, userId),
      ),
    )
    .orderBy(
      inactiveFellClassifications.fellId,
      inactiveFellClassifications.classificationId,
    )
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}
