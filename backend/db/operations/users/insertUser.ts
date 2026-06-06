import { db } from "../.."
import { NewUser, User, users } from "../../schema/users"

export async function insertUser(newUser: NewUser): Promise<User[]> {
  return await db
    .insert(users)
    .values(newUser)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        refreshToken: newUser.refreshToken,
        refreshTokenTag: newUser.refreshTokenTag,
        refreshTokenIv: newUser.refreshTokenIv,
        accessToken: newUser.accessToken,
        accessTokenTag: newUser.accessTokenTag,
        accessTokenIv: newUser.accessTokenIv,
        accessTokenExpiresAt: newUser.accessTokenExpiresAt,
        sessionId: newUser.sessionId,
      },
    })
    .returning()
}
