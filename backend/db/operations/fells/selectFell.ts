import { db } from "../.."
import { between, and, eq, inArray, gte, gt, lt, or } from "drizzle-orm"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import { Fell, activeFells, inactiveFells } from "../../schema/fells"
import { activeBags } from "../../schema/bags"
import { activeFellClassifications } from "../../schema/fellClassifications"

interface getFellsInRangeParams {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}

export async function getFellsInRange({
  minLatitude,
  maxLatitude,
  minLongitude,
  maxLongitude,
}: getFellsInRangeParams): Promise<Fell[]> {
  const result = await db
    .select()
    .from(activeFells)
    .where(
      and(
        between(activeFells.latitude, minLatitude, maxLatitude),
        between(activeFells.longitude, minLongitude, maxLongitude),
      ),
    )

  return result
}

export async function getFellFromId(fellId: number): Promise<Fell | null> {
  const result = await db
    .select()
    .from(activeFells)
    .where(eq(activeFells.id, fellId))
    .limit(1)

  if (result.length == 0) {
    console.error(`No fell found with id: ${fellId}`)
    return null
  }

  return result[0]
}

export async function getAllActiveUserFells(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  // Every fell that has a classification — public reference data, same for all users
  const classifiedFellsSubquery = db
    .selectDistinct({ fell_id: activeFellClassifications.fell_id })
    .from(activeFellClassifications)

  // Fells this user has ever bagged
  const baggedFellsSubquery = db
    .selectDistinct({ fell_id: activeBags.fell_id })
    .from(activeBags)
    .where(eq(activeBags.user_id, userId))

  // Fells newly bagged since last sync
  const newlyBaggedSubquery = db
    .selectDistinct({ fell_id: activeBags.fell_id })
    .from(activeBags)
    .where(
      and(
        eq(activeBags.user_id, userId),
        gte(activeBags.updated_at, startDate),
        lt(activeBags.updated_at, endDate),
      ),
    )

  // Fells newly classified since last sync (just added to a named list)
  const newlyClassifiedSubquery = db
    .selectDistinct({ fell_id: activeFellClassifications.fell_id })
    .from(activeFellClassifications)
    .where(
      and(
        gte(activeFellClassifications.updated_at, startDate),
        lt(activeFellClassifications.updated_at, endDate),
      ),
    )

  const result = await db
    .select({
      id: activeFells.id,
      name: activeFells.name,
      elevation: activeFells.elevation,
      latitude: activeFells.latitude,
      longitude: activeFells.longitude,
      country: activeFells.country,
    })
    .from(activeFells)
    .where(
      and(
        // In scope: either classified (public) or bagged by this user
        or(
          inArray(activeFells.id, classifiedFellsSubquery),
          inArray(activeFells.id, baggedFellsSubquery),
        ),
        // Delta: something about this fell actually changed/became relevant
        or(
          and(
            gte(activeFells.updated_at, startDate),
            lt(activeFells.updated_at, endDate),
          ),
          inArray(activeFells.id, newlyBaggedSubquery),
          inArray(activeFells.id, newlyClassifiedSubquery),
        ),
        page ? gt(activeFells.id, page) : undefined,
      ),
    )
    .orderBy(activeFells.id)
    .limit(ROW_RETURN_LIMIT)

  return result
}

// get inactive fells that are either classified or bagged by this user
export async function getAllInactiveUserFells(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  const classifiedFellsSubquery = db
    .selectDistinct({ fell_id: activeFellClassifications.fell_id })
    .from(activeFellClassifications)

  const baggedFellsSubquery = db
    .selectDistinct({ fell_id: activeBags.fell_id })
    .from(activeBags)
    .where(eq(activeBags.user_id, userId))

  const result = await db
    .select({
      id: inactiveFells.id,
      name: inactiveFells.name,
      elevation: inactiveFells.elevation,
      latitude: inactiveFells.latitude,
      longitude: inactiveFells.longitude,
      country: inactiveFells.country,
    })
    .from(inactiveFells)
    .where(
      and(
        or(
          inArray(inactiveFells.id, classifiedFellsSubquery),
          inArray(inactiveFells.id, baggedFellsSubquery),
        ),
        gte(inactiveFells.updated_at, startDate),
        lt(inactiveFells.updated_at, endDate),
        page ? gt(inactiveFells.id, page) : undefined,
      ),
    )
    .orderBy(inactiveFells.id)
    .limit(ROW_RETURN_LIMIT)

  return result
}
