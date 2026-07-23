import { eq, or } from "drizzle-orm"
import { db } from ".."
import { fells } from "../schema/fells"

async function update() {
  console.log("Updating database")
  await db
    .update(fells)
    .set({ country: "UK & Ireland", updated_at: new Date() })
    .where(or(eq(fells.country, "GB"), eq(fells.country, "Ireland")))

  console.log("Updated database")
  process.exit(0)
}

await update()
