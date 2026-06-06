import {
  integer,
  bigint,
  pgTable,
  text,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core"
import { users } from "./users"

export const activities = pgTable("activities", {
  id: bigint({ mode: "number" }).notNull().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  name: text().notNull(),
  distance: real(),
  elapsedTime: integer(),
  movingTime: integer(),
  elevation: real(),
  sport: text(),
  startDate: timestamp().notNull(),
  startLat: real(),
  startLong: real(),
  checkedDate: timestamp(),
  updatedAt: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
