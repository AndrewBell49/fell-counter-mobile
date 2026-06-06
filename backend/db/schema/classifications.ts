import { integer, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"

export const classifications = pgTable("classifications", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  updatedAt: timestamp().notNull().defaultNow(),
  active: boolean().notNull().default(true),
})

export type Classification = typeof classifications.$inferSelect
export type NewClassification = typeof classifications.$inferInsert
