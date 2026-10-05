import { updateActivity } from "../../../db/operations/activities/updateActivity"
import { insertBag } from "../../../db/operations/bags/insertBag"
import {
  getFellFromId,
  getFellsInRange,
} from "../../../db/operations/fells/selectFell"
import { NewBag } from "../../../db/schema/bags"
import { User } from "../../../db/schema/users"
import { getAccessTokenFromUser } from "../../identity/tokens"
import { getMaxMinLatLon } from "../../../lib/geo/latLon"
import { haversineDistance } from "../../../lib/geo/distance"
import { getActiveBagsForActivity } from "../../../db/operations/bags/selectBag"
import { deactivateBags } from "../../../db/operations/bags/updateBag"

const CHECK_N_POINTS = 5
const CHECK_N_SECONDS = 5
const DISTANCE_TO_COUNT = 40
const DISTANCE_TO_EXIT = 300

type FellBagState = {
  bagCount: number
  hasExited: boolean
  summitLat: number
  summitLon: number
}

export async function saveBagsFromActivity(
  user: User,
  activityId: number,
  activityStartDate: Date,
) {
  const accessToken = await getAccessTokenFromUser(user)

  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,time&key_by_type=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  const data = await response.json()
  const latLng = data.latlng
  if (!latLng) {
    await updateActivity(activityId, { checked_date: new Date() })
    return new Set<number>()
  }

  const points = latLng.data
  const times = data.time.data

  const fellIds = new Set<number>()
  const bags: NewBag[] = []

  // Tracks per-fell state across the whole activity
  const fellBagStates = new Map<number, FellBagState>()

  const sampledPoints: { lat: number; lon: number; time: number }[] = points
    .map(([lat, lon]: [number, number], i: number) => ({
      lat,
      lon,
      time: times[i],
    }))
    .filter((_: any, i: number, arr: { time: number }[]) => {
      if (i === 0) return true
      const everyNPoints = i % CHECK_N_POINTS === 0
      const everyNSeconds = arr[i].time - arr[i - 1].time >= CHECK_N_SECONDS
      return everyNPoints || everyNSeconds
    })

  // Process points sequentially to track exit state over time
  for (const { lat, lon, time } of sampledPoints) {
    const { minLatitude, maxLatitude, minLongitude, maxLongitude } =
      getMaxMinLatLon(lat, lon, DISTANCE_TO_COUNT)

    const pointFells = await getFellsInRange({
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
    })

    // Update exit state for all previously bagged fells
    for (const [_, state] of fellBagStates.entries()) {
      if (!state.hasExited) {
        const distFromSummit = haversineDistance(
          lat,
          lon,
          state.summitLat,
          state.summitLon,
        )
        if (distFromSummit >= DISTANCE_TO_EXIT) {
          state.hasExited = true
        }
      }
    }

    // Check whether each nearby fell should be bagged at this point
    for (const pointFell of pointFells) {
      const state = fellBagStates.get(pointFell.id)
      const bagDate = new Date(activityStartDate.getTime() + time * 1000)

      if (!state) {
        // First time near this fell — bag it
        fellBagStates.set(pointFell.id, {
          bagCount: 1,
          hasExited: false,
          summitLat: pointFell.latitude,
          summitLon: pointFell.longitude,
        })
        fellIds.add(pointFell.id)
        bags.push({
          fell_id: pointFell.id,
          user_id: user.id,
          activity_id: activityId,
          bag_sequence: 1,
          bag_date: bagDate,
        })
      } else if (state.hasExited) {
        // Returned to summit after exiting — bag it again
        state.bagCount++
        state.hasExited = false
        fellIds.add(pointFell.id)
        bags.push({
          fell_id: pointFell.id,
          user_id: user.id,
          activity_id: activityId,
          bag_sequence: state.bagCount,
          bag_date: bagDate,
        })
      }
      // Otherwise: already bagged and hasn't exited, or hit max — skip
    }
  }

  await Promise.all(
    bags.map(async (bag) => {
      const [bagInserted] = await insertBag(bag)
      if (bagInserted) {
        const fellName =
          (await getFellFromId(bagInserted.fell_id))?.name ||
          bagInserted.fell_id.toString()
        console.log(`Found bag of fell ${fellName} at ${bagInserted.bag_date}`)
      } else {
        console.error(
          `Error inserting bag: ${JSON.stringify(bag)} - didn't insert anything`,
        )
      }
    }),
  )

  const currentKeys = new Set(
    bags.map((bag) => `${bag.fell_id}:${bag.bag_sequence}`),
  )
  const existingActiveBags = await getActiveBagsForActivity(activityId)
  const staleBagIds = existingActiveBags
    .filter((b) => !currentKeys.has(`${b.fell_id}:${b.bag_sequence}`))
    .map((b) => b.id)

  if (staleBagIds.length > 0) {
    await deactivateBags(user.id, staleBagIds)
    console.log(
      `Deactivated ${staleBagIds.length} stale bag(s) for activity ${activityId}`,
    )
  }

  await updateActivity(activityId, { checked_date: new Date() })
  return fellIds
}
