import { pgView } from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { db } from ".."
import { bags } from "./bags"

export const activeBags = pgView("active_bags").as(
  db.select().from(bags).where(eq(bags.active, true)),
)

export const inactiveBags = pgView("inactive_bags").as(
  db.select().from(bags).where(eq(bags.active, false)),
)
