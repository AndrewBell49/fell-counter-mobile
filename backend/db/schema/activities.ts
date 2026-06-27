import {
  integer,
  bigint,
  pgTable,
  text,
  real,
  timestamp,
  boolean,
  pgView,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { eq } from "drizzle-orm"
import { db } from ".."

export const activities = pgTable("activities", {
  id: bigint({ mode: "number" }).notNull().primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => users.id),
  name: text().notNull(),
  distance: real(),
  elapsed_time: integer(),
  moving_time: integer(),
  elevation: real(),
  sport: text(),
  start_date: timestamp().notNull(),
  start_lat: real(),
  start_long: real(),
  checked_date: timestamp(),
  updated_at: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert

export const activeActivities = pgView("active_activities").as(
  db.select().from(activities).where(eq(activities.active, true)),
)

export const inactiveActivities = pgView("inactive_activities").as(
  db.select().from(activities).where(eq(activities.active, false)),
)
