import { pgView } from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { db } from ".."
import { classifications } from "./classifications"

export const activeClassifications = pgView("active_classifications").as(
  db.select().from(classifications).where(eq(classifications.active, true)),
)

export const inactiveClassifications = pgView("inactive_classifications").as(
  db.select().from(classifications).where(eq(classifications.active, false)),
)
