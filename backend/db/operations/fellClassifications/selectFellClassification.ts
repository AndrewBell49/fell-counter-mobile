import { and, gte, gt, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  activeFellClassifications,
  inactiveFellClassifications,
} from "../../schema/fellClassifications"

export async function getAllActiveFellClassifications(
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
    .where(
      and(
        gte(activeFellClassifications.updated_at, startDate),
        lt(activeFellClassifications.updated_at, endDate),
        page ? gt(activeFellClassifications.fell_id, page) : undefined,
      ),
    )
    .orderBy(
      activeFellClassifications.fell_id,
      activeFellClassifications.classification_id,
    )
    .limit(ROW_RETURN_LIMIT)
}

export async function getAllInactiveFellClassifications(
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
    .where(
      and(
        gte(inactiveFellClassifications.updated_at, startDate),
        lt(inactiveFellClassifications.updated_at, endDate),
        page ? gt(inactiveFellClassifications.fell_id, page) : undefined,
      ),
    )
    .orderBy(
      inactiveFellClassifications.fell_id,
      inactiveFellClassifications.classification_id,
    )
    .limit(ROW_RETURN_LIMIT)
}
