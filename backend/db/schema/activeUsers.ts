import { pgView } from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { users } from "./users"
import { db } from ".."

export const activeUsers = pgView("active_users").as(
  db.select().from(users).where(eq(users.active, true)),
)

export const inactiveUsers = pgView("inactive_users").as(
  db.select().from(users).where(eq(users.active, false)),
)
