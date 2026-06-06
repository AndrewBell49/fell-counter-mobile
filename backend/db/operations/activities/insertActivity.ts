import { db } from "../.."
import { activities, NewActivity, Activity } from "../../schema/activities"

export async function insertActivity(
  activity: NewActivity,
): Promise<Activity[]> {
  return await db
    .insert(activities)
    .values(activity)
    .onConflictDoNothing()
    .returning()
}
