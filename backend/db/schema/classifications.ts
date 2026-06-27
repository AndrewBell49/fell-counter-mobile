import {
  integer,
  pgTable,
  text,
  timestamp,
  boolean,
  pgView,
} from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { db } from ".."

export const classifications = pgTable("classifications", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  updated_at: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Classification = typeof classifications.$inferSelect
export type NewClassification = typeof classifications.$inferInsert

export const activeClassifications = pgView("active_classifications").as(
  db.select().from(classifications).where(eq(classifications.active, true)),
)

export const inactiveClassifications = pgView("inactive_classifications").as(
  db.select().from(classifications).where(eq(classifications.active, false)),
)
