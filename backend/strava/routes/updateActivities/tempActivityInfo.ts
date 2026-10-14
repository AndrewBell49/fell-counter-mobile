import axios from "axios"
import { getAccessTokenFromUser } from "../../identity/tokens"
import { Activity, NewActivity } from "../../../db/schema/activities"
import { insertActivity } from "../../../db/operations/activities/insertActivity"
import {
  getMinMaxActivityDate,
  getActivityById,
} from "../../../db/operations/activities/selectActivity"
import { User } from "../../../db/schema/users"

const PER_PAGE = 200
const FULL_REFRESH_EVERY = 7 * 24 * 60 * 60 * 1000

// Helper function to throttle API requests and avoid rate limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function saveAndGetActivityInfoWithCutoff(
  user: User,
  // Cutoff date parsed from ISO format (corrected 13:103 to valid minute formatting)
  cutoffDate: Date = new Date("2026-10-14T13:03:04.525Z"),
) {
  const accessToken = await getAccessTokenFromUser(user)
  const { maxDate } = await getMinMaxActivityDate(user.id)

  let page = 1
  let dataGot = true

  let params: Record<string, any> = {
    per_page: PER_PAGE,
  }

  const fullRefresh =
    !user.last_full_refresh ||
    new Date().getTime() - new Date(user.last_full_refresh).getTime() >
      FULL_REFRESH_EVERY

  if (!fullRefresh && maxDate) {
    params.after = Math.floor(new Date(maxDate).getTime() / 1000)
    console.log("Searching activities after last sync date")
  } else {
    console.log("Starting full refresh")
  }

  const activityIds: Activity[] = []

  while (dataGot) {
    let response

    try {
      response = await axios.get(
        "https://www.strava.com/api/v3/athlete/activities",
        {
          params: { ...params, page },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
    } catch (err: any) {
      if (err.response?.status === 429) {
        console.error(
          "Strava rate limit exceeded (429). Halting sync process cleanly.",
        )
        break
      }
      throw err
    }

    const activities = response.data

    if (!activities || activities.length === 0) {
      dataGot = false
      console.log("All activities retrieved")
      break
    }

    for (const data of activities) {
      // 1. Check local DB state before making a detail network request
      const existingActivity = await getActivityById(data.id)

      if (existingActivity && existingActivity.updated_at) {
        const updatedAt = new Date(existingActivity.updated_at)
        if (updatedAt > cutoffDate) {
          console.log(
            `Skipping activity ${data.id} (${data.name}): Updated after cutoff date.`,
          )
          continue
        }
      }

      let description: string | null = null

      try {
        // Throttle requests slightly (200ms) to reduce 429 rate-limiting
        await sleep(200)

        const detailRes = await axios.get(
          `https://www.strava.com/api/v3/activities/${data.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        description = detailRes.data.description || null
      } catch (err: any) {
        if (err.response?.status === 429) {
          console.error(
            "Hit Strava rate limit during detail fetch (429). Aborting remaining detail calls.",
          )
          break
        }
        console.warn(`Could not fetch detail for activity ${data.id}`)
      }

      const activity: NewActivity = {
        id: data.id,
        user_id: user.id,
        name: data.name,
        distance: data.distance,
        moving_time: data.moving_time,
        elapsed_time: data.elapsed_time,
        elevation: data.total_elevation_gain,
        sport: data.sport_type || data.type,
        start_date: new Date(data.start_date),
        start_lat: data.start_latlng?.[0] ?? null,
        start_long: data.start_latlng?.[1] ?? null,

        average_speed: data.average_speed,
        max_speed: data.max_speed,
        summary_polyline: data.map?.summary_polyline ?? null,
        description: description,
        updated_at: new Date(),
      }

      console.log(`Inserting/Updating activity: ${data.name}`)
      const insertedActivities = await insertActivity(activity)
      if (insertedActivities) {
        activityIds.push(...insertedActivities)
      }
    }

    page++
  }

  return { activityIds, fullRefresh }
}
