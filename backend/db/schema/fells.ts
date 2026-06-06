import {
  integer,
  pgTable,
  text,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core"

export const fells = pgTable("fells", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
  elevation: real().notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  country: text().notNull(),
  updatedAt: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Fell = typeof fells.$inferSelect
export type NewFell = typeof fells.$inferInsert
