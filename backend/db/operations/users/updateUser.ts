import { eq } from "drizzle-orm"
import { db } from "../.."
import { User, users } from "../../schema/users"

export async function updateUser(
  userId: number,
  updatedUser: Partial<Omit<User, "id" | "createdAt">>,
) {
  await db
    .update(users)
    .set({ ...updatedUser, updated_at: new Date() })
    .where(eq(users.id, userId))
}
