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

const CHECK_N_POINTS = 5
const CHECK_N_SECONDS = 5
const DISTANCE_TO_COUNT = 40

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
    await updateActivity(activityId, { checkedDate: new Date() })
    return new Set<number>()
  }

  const points = latLng.data
  const times = data.time.data

  const bags: NewBag[] = []
  const fellIds = new Set<number>()

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

  await Promise.all(
    sampledPoints.map(async ({ lat, lon, time }) => {
      const { minLatitude, maxLatitude, minLongitude, maxLongitude } =
        getMaxMinLatLon(lat, lon, DISTANCE_TO_COUNT)

      const pointFells = await getFellsInRange({
        minLatitude,
        maxLatitude,
        minLongitude,
        maxLongitude,
      })

      pointFells.forEach((pointFell) => {
        const bagDate = new Date(activityStartDate.getTime() + time * 1000)
        bags.push({
          fellId: pointFell.id,
          userId: user.id,
          activityId: activityId,
          bagDate: bagDate,
        })
      })
    }),
  )

  await Promise.all(
    bags.map(async (bag) => {
      if (!fellIds.has(bag.fellId)) {
        fellIds.add(bag.fellId)

        const [bagInserted] = await insertBag(bag)
        if (bagInserted) {
          const fellName =
            (await getFellFromId(bagInserted.fellId))?.name ||
            bagInserted.fellId.toString()

          console.log(`Found bag of fell ${fellName} at ${bagInserted.bagDate}`)
        } else {
          console.error(
            `Error inserting bag: ${JSON.stringify(bag)} - didn't insert anything`,
          )
        }
      }
    }),
  )
  await updateActivity(activityId, { checkedDate: new Date() })

  return fellIds
}
