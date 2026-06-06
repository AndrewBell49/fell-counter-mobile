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
    user.accessTokenExpiresAt.getTime() - refreshBuffer,
  )

  if (now > refreshAt) {
    const refreshToken = decrypt(
      user.refreshToken,
      user.refreshTokenTag,
      user.refreshTokenIv,
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
      refreshToken: newRefreshToken,
      refreshTokenTag: newRefreshTokenTag,
      refreshTokenIv: newRefreshTokenIv,
      accessToken: newAccessToken,
      accessTokenTag: newAccessTokenTag,
      accessTokenIv: newAccessTokenIv,
      accessTokenExpiresAt: new Date(expires_at),
    })
    return access_token
  }

  return decrypt(user.accessToken, user.accessTokenTag, user.accessTokenIv)
}
