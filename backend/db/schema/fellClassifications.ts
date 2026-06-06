import { integer, pgTable, timestamp, boolean } from "drizzle-orm/pg-core"
import { fells } from "./fells"
import { classifications } from "./classifications"

export const fellClassifications = pgTable("fellClassifications", {
  fellId: integer()
    .notNull()
    .references(() => fells.id),
  classificationId: integer()
    .notNull()
    .references(() => classifications.id),
  updatedAt: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type FellClassification = typeof fellClassifications.$inferSelect
export type NewFellClassification = typeof fellClassifications.$inferInsert
