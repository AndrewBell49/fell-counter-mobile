import { sql } from "drizzle-orm"
import { db } from "../.."
import { Bag, bags, NewBag } from "../../schema/bags"

export async function insertBag(bagInput: NewBag | NewBag[]): Promise<Bag[]> {
  const bagList = Array.isArray(bagInput) ? bagInput : [bagInput]

  if (bagList.length === 0) {
    return []
  }

  return await db
    .insert(bags)
    .values(bagList)
    .onConflictDoUpdate({
      target: [bags.fell_id, bags.user_id, bags.activity_id, bags.bag_sequence],
      set: {
        bag_date: sql`EXCLUDED.bag_date`,
        updated_at: new Date(),
        active: true,
      },
    })
    .returning()
}
