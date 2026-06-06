import { pgView } from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { fells } from "./fells"
import { db } from ".."

export const activeFells = pgView("active_fells").as(
  db.select().from(fells).where(eq(fells.active, true)),
)

export const inactiveFells = pgView("inactive_fells").as(
  db.select().from(fells).where(eq(fells.active, false)),
)
