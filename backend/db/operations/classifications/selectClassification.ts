import { and, gte, lt } from "drizzle-orm"
import { db } from "../.."
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  activeClassifications,
  inactiveClassifications,
} from "../../schema/classifications"

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
        gte(activeClassifications.updated_at, startDate),
        lt(activeClassifications.updated_at, endDate),
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
        gte(inactiveClassifications.updated_at, startDate),
        lt(inactiveClassifications.updated_at, endDate),
      ),
    )
    .orderBy(inactiveClassifications.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)
}
