import { integer, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: integer().notNull().primaryKey(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  city: text(),
  state: text(),
  country: text(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),

  lastFullRefresh: timestamp().notNull().defaultNow(),

  refreshToken: text().notNull(),
  refreshTokenTag: text().notNull(),
  refreshTokenIv: text().notNull(),

  accessToken: text().notNull(),
  accessTokenTag: text().notNull(),
  accessTokenIv: text().notNull(),
  accessTokenExpiresAt: timestamp().notNull(),

  sessionId: text().notNull().unique(),

  active: boolean().notNull().default(true),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
