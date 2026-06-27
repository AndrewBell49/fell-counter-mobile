import {
  integer,
  pgTable,
  text,
  real,
  timestamp,
  boolean,
  pgView,
} from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { db } from ".."

export const fells = pgTable("fells", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
  elevation: real().notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  country: text().notNull(),
  updated_at: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Fell = typeof fells.$inferSelect
export type NewFell = typeof fells.$inferInsert

export const activeFells = pgView("active_fells").as(
  db.select().from(fells).where(eq(fells.active, true)),
)

export const inactiveFells = pgView("inactive_fells").as(
  db.select().from(fells).where(eq(fells.active, false)),
)
