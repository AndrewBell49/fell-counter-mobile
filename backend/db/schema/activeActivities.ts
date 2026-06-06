import { eq } from "drizzle-orm"
import { pgView } from "drizzle-orm/pg-core"
import { db } from ".."
import { activities } from "./activities"

export const activeActivities = pgView("active_activities").as(
  db.select().from(activities).where(eq(activities.active, true)),
)

export const inactiveActivities = pgView("inactive_activities").as(
  db.select().from(activities).where(eq(activities.active, false)),
)
