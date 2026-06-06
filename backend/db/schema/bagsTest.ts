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

export const bagsTest = pgTable("bagsTest", {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  distance: integer().notNull(),
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

export type BagTest = typeof bagsTest.$inferSelect
export type NewBagTest = typeof bagsTest.$inferInsert
