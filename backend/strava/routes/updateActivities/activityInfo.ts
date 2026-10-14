import axios from "axios"
import { getAccessTokenFromUser } from "../../identity/tokens"
import { Activity, NewActivity } from "../../../db/schema/activities"
import { insertActivity } from "../../../db/operations/activities/insertActivity"
import { getMinMaxActivityDate } from "../../../db/operations/activities/selectActivity"
import { User } from "../../../db/schema/users"

// max per page allowed
const PER_PAGE = 200
const FULL_REFRESH_EVERY = 4 * 7 * 24 * 60 * 60 * 1000

export async function saveAndGetActivityInfo(user: User) {
  const accessToken = await getAccessTokenFromUser(user)

  const { maxDate } = await getMinMaxActivityDate(user.id)
  let page = 1
  let dataGot = true

  let params: any = {
    perPage: PER_PAGE,
  }
  const fullRefresh =
    new Date().getTime() - user.last_full_refresh.getTime() > FULL_REFRESH_EVERY

  // only search after most recent activity, except every FULL_REFRESH_EVERY ms
  if (!fullRefresh) {
    params = { ...params, after: Math.round(maxDate.getTime() / 1000) }
    console.log("Searching activities")
  } else {
    console.log("Starting full refresh")
  }

  const activityIds: Activity[] = []

  while (dataGot) {
    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        params: { ...params, page },
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    const activities = response.data

    if (!activities || activities.length === 0) {
      dataGot = false
      console.log("All activities retrieved")
      break
    }

    for (const data of activities) {
      let description: string | null = null

      try {
        const detailRes = await axios.get(
          `https://www.strava.com/api/v3/activities/${data.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        description = detailRes.data.description || null
      } catch (err) {
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
      }

      console.log(`Inserting activity: ${data.name}`)
      const insertedActivities = await insertActivity(activity)
      if (insertedActivities) {
        activityIds.push(...insertedActivities)
      }
    }

    page++
  }

  return { activityIds, fullRefresh }
}
