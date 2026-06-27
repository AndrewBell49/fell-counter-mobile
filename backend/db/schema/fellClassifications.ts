import {
  integer,
  pgTable,
  timestamp,
  boolean,
  pgView,
} from "drizzle-orm/pg-core"
import { fells } from "./fells"
import { classifications } from "./classifications"
import { eq } from "drizzle-orm"
import { db } from ".."

export const fellClassifications = pgTable("fell_classifications", {
  fell_id: integer()
    .notNull()
    .references(() => fells.id),
  classification_id: integer()
    .notNull()
    .references(() => classifications.id),
  updated_at: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type FellClassification = typeof fellClassifications.$inferSelect
export type NewFellClassification = typeof fellClassifications.$inferInsert

export const activeFellClassifications = pgView(
  "active_fell_classifications",
).as(
  db
    .select()
    .from(fellClassifications)
    .where(eq(fellClassifications.active, true)),
)

export const inactiveFellClassifications = pgView(
  "inactive_fell_classifications",
).as(
  db
    .select()
    .from(fellClassifications)
    .where(eq(fellClassifications.active, false)),
)
