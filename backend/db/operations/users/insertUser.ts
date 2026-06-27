import { db } from "../.."
import { NewUser, User, users } from "../../schema/users"

export async function insertUser(newUser: NewUser): Promise<User[]> {
  return await db
    .insert(users)
    .values(newUser)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        refresh_token: newUser.refresh_token,
        refresh_token_tag: newUser.refresh_token_tag,
        refresh_token_iv: newUser.refresh_token_iv,
        access_token: newUser.access_token,
        access_token_tag: newUser.access_token_tag,
        access_token_iv: newUser.access_token_iv,
        access_token_expires_at: newUser.access_token_expires_at,
        session_id: newUser.session_id,
      },
    })
    .returning()
}
