import {
  bigint,
  integer,
  pgTable,
  timestamp,
  boolean,
  pgView,
} from "drizzle-orm/pg-core"
import { fells } from "./fells"
import { users } from "./users"
import { activities } from "./activities"
import { eq } from "drizzle-orm"
import { db } from ".."

export const bags = pgTable("bags", {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  fell_id: integer()
    .notNull()
    .references(() => fells.id),
  user_id: integer()
    .notNull()
    .references(() => users.id),
  activity_id: bigint({ mode: "number" })
    .notNull()
    .references(() => activities.id),
  bag_date: timestamp().notNull(),
  updated_at: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Bag = typeof bags.$inferSelect
export type NewBag = typeof bags.$inferInsert

export const activeBags = pgView("active_bags").as(
  db.select().from(bags).where(eq(bags.active, true)),
)

export const inactiveBags = pgView("inactive_bags").as(
  db.select().from(bags).where(eq(bags.active, false)),
)
