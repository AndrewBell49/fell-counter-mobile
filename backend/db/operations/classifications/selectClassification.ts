import { and, gte, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  activeClassifications,
  inactiveClassifications,
} from "../../schema/activeClassifications"

export async function getAllActiveClassifications(
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .selectDistinct({
      id: activeClassifications.id,
      name: activeClassifications.name,
      description: activeClassifications.description,
    })
    .from(activeClassifications)
    .where(
      and(
        gte(activeClassifications.updatedAt, startDate),
        lt(activeClassifications.updatedAt, endDate),
      ),
    )
    .orderBy(activeClassifications.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}

export async function getAllInactiveClassifications(
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  return await db
    .selectDistinct({
      id: inactiveClassifications.id,
      name: inactiveClassifications.name,
      description: inactiveClassifications.description,
    })
    .from(inactiveClassifications)
    .where(
      and(
        gte(inactiveClassifications.updatedAt, startDate),
        lt(inactiveClassifications.updatedAt, endDate),
      ),
    )
    .orderBy(inactiveClassifications.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}
