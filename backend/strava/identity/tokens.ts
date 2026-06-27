import { decrypt, encrypt } from "../../auth/encryption"
import { updateUser } from "../../db/operations/users/updateUser"
import { User } from "../../db/schema/users"
import { ENV } from "../../lib/env"
import { makeRequest } from "../requests/retryRequest"

const REFRESH_BUFFER = 5 * 60 * 1000

export async function getAccessTokenFromUser(
  user: User,
  refreshBuffer = REFRESH_BUFFER,
) {
  const now = new Date()
  const refreshAt = new Date(
    user.access_token_expires_at.getTime() - refreshBuffer,
  )

  if (now > refreshAt) {
    const refreshToken = decrypt(
      user.refresh_token,
      user.refresh_token_tag,
      user.refresh_token_iv,
    )

    const tokenData = await makeRequest<{
      refresh_token: string
      access_token: string
      expires_at: string
    }>("https://www.strava.com/oauth/token", {
      method: "POST",
      data: {
        client_id: ENV.clientId,
        client_secret: ENV.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
    })

    if (!tokenData.ok) {
      throw Error(`Failed to get access token`)
    }

    const { refresh_token, access_token, expires_at } = tokenData.data

    const {
      cipherText: newAccessToken,
      tag: newAccessTokenTag,
      iv: newAccessTokenIv,
    } = encrypt(access_token)
    const {
      cipherText: newRefreshToken,
      tag: newRefreshTokenTag,
      iv: newRefreshTokenIv,
    } = encrypt(refresh_token)

    await updateUser(user.id, {
      refresh_token: newRefreshToken,
      refresh_token_tag: newRefreshTokenTag,
      refresh_token_iv: newRefreshTokenIv,
      access_token: newAccessToken,
      access_token_tag: newAccessTokenTag,
      access_token_iv: newAccessTokenIv,
      access_token_expires_at: new Date(expires_at),
    })
    return access_token
  }

  return decrypt(user.access_token, user.access_token_tag, user.access_token_iv)
}
