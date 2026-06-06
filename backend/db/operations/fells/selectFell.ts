import { db } from "../.."
import { between, and, eq, inArray, gte, lt, or } from "drizzle-orm"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import { activeFells, inactiveFells } from "../../schema/activeFells"
import { activeBags } from "../../schema/activeBags"
import { Fell } from "../../schema/fells"
import { bags } from "../../schema/bags"

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
  // Fells newly bagged since last sync
  const newlyBaggedSubquery = db
    .selectDistinct({ fellId: activeBags.fellId })
    .from(activeBags)
    .where(
      and(
        eq(activeBags.userId, userId),
        gte(activeBags.updatedAt, startDate),
        lt(activeBags.updatedAt, endDate),
      ),
    )

  // All fells the user has ever bagged (for catching fell data updates)
  const allBaggedSubquery = db
    .selectDistinct({ fellId: activeBags.fellId })
    .from(activeBags)
    .where(eq(activeBags.userId, userId))

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
        inArray(activeFells.id, allBaggedSubquery),
        or(
          // Either the fell data itself changed
          and(
            gte(activeFells.updatedAt, startDate),
            lt(activeFells.updatedAt, endDate),
          ),
          // Or it was newly bagged
          inArray(activeFells.id, newlyBaggedSubquery),
        ),
      ),
    )
    .orderBy(activeFells.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)

  return result
}

// get inactive fells from all of the users bags - active or inactive
export async function getAllInactiveUserFells(
  userId: number,
  page: number | undefined,
  startDate: Date,
  endDate: Date,
) {
  const allBaggedFellIdsSubquery = db
    .selectDistinct({ fellId: bags.fellId })
    .from(bags)
    .where(eq(bags.userId, userId)) // no date filter - all bags ever

  const result = await db
    .select({
      id: activeFells.id,
      name: activeFells.name,
      elevation: activeFells.elevation,
      latitude: activeFells.latitude,
      longitude: activeFells.longitude,
      country: activeFells.country,
    })
    .from(inactiveFells)
    .where(
      and(
        inArray(inactiveFells.id, allBaggedFellIdsSubquery),
        gte(inactiveFells.updatedAt, startDate),
        lt(inactiveFells.updatedAt, endDate),
      ),
    )
    .orderBy(inactiveFells.id)
    .limit(ROW_RETURN_LIMIT)
    .offset((page ?? 0) * ROW_RETURN_LIMIT)

  return result
}
