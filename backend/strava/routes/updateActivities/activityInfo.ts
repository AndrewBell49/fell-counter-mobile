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
    console.log("Starting full refresh")
    params = { ...params, after: Math.round(maxDate.getTime() / 1000) }
  }

  const activityIds: Activity[] = []

  while (dataGot) {
    const response = await axios.get(
      "https://www.strava.com/api/v3/activities",
      {
        params: { ...params, page: page },
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    response.data.forEach(
      async (data: {
        id: any
        name: any
        distance: any
        moving_time: any
        elapsed_time: any
        total_elevation_gain: any
        sport_type: any
        start_date: string | number | Date
        start_latlng: any[]
      }) => {
        const activity: NewActivity = {
          id: data.id,
          user_id: user.id,
          name: data.name,
          distance: data.distance,
          moving_time: data.moving_time,
          elapsed_time: data.elapsed_time,
          elevation: data.total_elevation_gain,
          sport: data.sport_type,
          start_date: new Date(data.start_date),
          start_lat: data.start_latlng[0],
          start_long: data.start_latlng[1],
        }
        console.log(`Inserting activity: ${data.name}`)
        const insertedActivities = await insertActivity(activity)
        activityIds.push(...insertedActivities)
      },
    )

    if (response.data.length == 0) {
      dataGot = false
      console.log("All activities got")
    }

    page++
  }
  return { activityIds, fullRefresh }
}
