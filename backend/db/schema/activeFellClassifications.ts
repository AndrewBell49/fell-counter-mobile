import { pgView } from "drizzle-orm/pg-core"
import { eq } from "drizzle-orm"
import { db } from ".."
import { fellClassifications } from "./fellClassifications"

export const activeFellClassifications = pgView(
  "active_fell_classifications",
).as(
  db
    .select()
    .from(fellClassifications)
    .where(eq(fellClassifications.active, true)),
)

export const inactiveFellClassifications = pgView(
  "inactive_fell_classifications",
).as(
  db
    .select()
    .from(fellClassifications)
    .where(eq(fellClassifications.active, false)),
)
