import { eq } from "drizzle-orm"
import { db } from "../.."
import { activities, Activity } from "../../schema/activities"

export async function updateActivity(
  activityId: number,
  updatedActivity: Partial<Activity>,
) {
  await db
    .update(activities)
    .set({
      ...updatedActivity,
      updated_at: new Date(),
      checked_date: new Date(),
    })
    .where(eq(activities.id, activityId))
}
