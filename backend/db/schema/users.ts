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

export const users = pgTable("users", {
  id: integer().notNull().primaryKey(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  city: text(),
  state: text(),
  country: text(),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),

  last_full_refresh: timestamp().notNull().defaultNow(),

  refresh_token: text().notNull(),
  refresh_token_tag: text().notNull(),
  refresh_token_iv: text().notNull(),

  access_token: text().notNull(),
  access_token_tag: text().notNull(),
  access_token_iv: text().notNull(),
  access_token_expires_at: timestamp().notNull(),

  session_id: text().notNull().unique(),

  active: boolean().notNull().default(true),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const activeUsers = pgView("active_users").as(
  db.select().from(users).where(eq(users.active, true)),
)

export const inactiveUsers = pgView("inactive_users").as(
  db.select().from(users).where(eq(users.active, false)),
)
