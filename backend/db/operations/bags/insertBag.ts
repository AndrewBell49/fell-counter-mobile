import { db } from "../.."
import { Bag, bags, NewBag } from "../../schema/bags"

export async function insertBag(bag: NewBag): Promise<Bag[]> {
  return await db.insert(bags).values(bag).onConflictDoNothing().returning()
}
