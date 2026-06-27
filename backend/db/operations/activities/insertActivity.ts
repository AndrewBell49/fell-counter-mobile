import { getTableColumns, sql, or } from "drizzle-orm"
import { db } from "../.."
import { activities, NewActivity, Activity } from "../../schema/activities"

export async function insertActivity(
  activity: NewActivity,
): Promise<Activity[]> {
  const { id, updated_at, ...updateColumns } = getTableColumns(activities)

  const conflictSet = Object.fromEntries(
    Object.keys(updateColumns).map((key) => [key, sql.raw(`EXCLUDED.${key}`)]),
  )

  const hasChanges = or(
    ...Object.keys(updateColumns).map(
      (key) =>
        sql`${activities[key as keyof typeof updateColumns]} IS DISTINCT FROM EXCLUDED.${sql.raw(key)}`,
    ),
  )

  return await db
    .insert(activities)
    .values(activity)
    .onConflictDoUpdate({
      target: activities.id,
      set: {
        ...conflictSet,
        updated_at: new Date(),
      },
      where: hasChanges,
    })
    .returning()
}
