import {
  bigint,
  integer,
  pgTable,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core"
import { fells } from "./fells"
import { users } from "./users"
import { activities } from "./activities"

export const bags = pgTable("bags", {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  fellId: integer()
    .notNull()
    .references(() => fells.id),
  userId: integer()
    .notNull()
    .references(() => users.id),
  activityId: bigint({ mode: "number" })
    .notNull()
    .references(() => activities.id),
  bagDate: timestamp().notNull(),
  updatedAt: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Bag = typeof bags.$inferSelect
export type NewBag = typeof bags.$inferInsert
