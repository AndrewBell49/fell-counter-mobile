import { eq } from "drizzle-orm"
import { db } from "../.."
import { activities, Activity } from "../../schema/activities"

export async function updateActivity(
  activityId: number,
  updatedActivity: Partial<Activity>,
) {
  await db
    .update(activities)
    .set({ ...updatedActivity, updatedAt: new Date(), checkedDate: new Date() })
    .where(eq(activities.id, activityId))
}
