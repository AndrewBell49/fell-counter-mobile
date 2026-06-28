import { saveAndGetActivityInfo } from "./activityInfo"
import { saveBagsFromActivity } from "./activityBags"
import { getAllUncheckedActivities } from "../../../db/operations/activities/selectActivity"
import { getError } from "../../../lib/errors/errorMessage"
import { User } from "../../../db/schema/users"
import { activeJobs } from "../../../lib/jobs/activeJobs"
import { updateUser } from "../../../db/operations/users/updateUser"

const BATCH_DOWNLOAD = 10

export async function updateActivities(user: User) {
  try {
    const { fullRefresh } = await saveAndGetActivityInfo(user)

    const activities = await getAllUncheckedActivities(user.id)

    if (fullRefresh) {
      updateUser(user.id, { last_full_refresh: new Date() })
    }

    for (let i = 0; i < activities.length; i += BATCH_DOWNLOAD) {
      const batch = activities.slice(i, i + BATCH_DOWNLOAD)

      await Promise.all(
        batch.map(async (activity) => {
          // const fellIds =
          await saveBagsFromActivity(user, activity.id, activity.start_date)

          const indexPadded = i
            .toString()
            .padStart(activities.length.toString().length)
          console.log(
            `${indexPadded}/${activities.length} Saved `, //${fellIds.size} bags for ${activity.name}`,
          )
        }),
      )
    }

    activeJobs.set(user.session_id, { status: "completed" })
  } catch (err) {
    console.log(getError(err).message)
    activeJobs.set(user.session_id, { status: "failed" })
  } finally {
    setTimeout(() => activeJobs.delete(user.session_id), 10 * 60 * 1000)
  }
}
