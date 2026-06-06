import { eq } from "drizzle-orm"
import { db } from "../.."
import { Fell, fells } from "../../schema/fells"

export async function updateFell(fellId: number, updatedFell: Partial<Fell>) {
  await db
    .update(fells)
    .set({ ...updatedFell, updatedAt: new Date() })
    .where(eq(fells.id, fellId))
}
