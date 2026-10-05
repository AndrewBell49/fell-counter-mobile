import { and, eq, inArray } from "drizzle-orm"
import { db } from "../.."
import { bags, Bag } from "../../schema/bags"

export async function deactivateBags(
  userId: number,
  bagIds: number[],
): Promise<Bag[]> {
  if (bagIds.length === 0) return []
  return await db
    .update(bags)
    .set({ active: false, updated_at: new Date() })
    .where(and(eq(bags.user_id, userId), inArray(bags.id, bagIds)))
    .returning()
}
