import { db } from "../.."
import { eq } from "drizzle-orm"
import { User, activeUsers } from "../../schema/users"

export async function getUserFromSessionId(sessionId: string): Promise<User> {
  const result = await db
    .select()
    .from(activeUsers)
    .where(eq(activeUsers.session_id, sessionId))
    .limit(1)

  if (result.length == 0) {
    console.log(`No user found with sessionId: ${sessionId}`)
    throw Error("No user found with that sessionId")
  }

  return result[0]
}
