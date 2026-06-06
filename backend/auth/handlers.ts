import axios from "axios"
import crypto from "crypto"
import { Request, Response } from "express"

import { NewUser } from "../db/schema/users"
import { insertUser } from "../db/operations/users/insertUser"
import { encrypt } from "./encryption"
import { ENV } from "../lib/env"

const REDIRECT_URI = `${ENV.serverUrl}/auth/callback`

export function getAuthUrl(req: Request, res: Response) {
  const platform = (req.query.platform as string) ?? "mobile"

  const url =
    `https://www.strava.com/oauth/authorize` +
    `?client_id=${ENV.clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=activity:read` +
    `&state=${platform}`

  res.json({ url })
}

export async function getCallback(req: Request, res: Response) {
  const platform = req.query.state as string

  try {
    const code = req.query.code as string

    const tokenResp = await axios.post("https://www.strava.com/oauth/token", {
      client_id: ENV.clientId,
      client_secret: ENV.clientSecret,
      code,
      grant_type: "authorization_code",
    })

    const { refresh_token, access_token, expires_at, athlete } = tokenResp.data

    // Generate a session ID for the app to use
    const sessionId = crypto.randomUUID()

    const refreshTokenEncrypted = encrypt(refresh_token)
    const accessTokenEncrypted = encrypt(access_token)

    const newUser: NewUser = {
      id: athlete.id,
      firstName: athlete.firstname,
      lastName: athlete.lastname,
      city: athlete.city,
      state: athlete.state,
      country: athlete.country,

      refreshToken: refreshTokenEncrypted.cipherText,
      refreshTokenTag: refreshTokenEncrypted.tag,
      refreshTokenIv: refreshTokenEncrypted.iv,

      accessToken: accessTokenEncrypted.cipherText,
      accessTokenTag: accessTokenEncrypted.tag,
      accessTokenIv: accessTokenEncrypted.iv,
      accessTokenExpiresAt: new Date(expires_at * 1000),

      sessionId: sessionId,
    }

    const user = (await insertUser(newUser))[0]

    console.log(user)

    let redirectUrlBase = "fellcounter://callback"
    if (platform === "web") {
      redirectUrlBase = ENV.webCallbackUrl
    }
    // Only send session ID and basic info back to app
    res.redirect(
      `${redirectUrlBase}?sessionId=${user.sessionId}&name=${encodeURIComponent(user.firstName + " " + user.lastName)}&id=${user.id}`,
    )
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Strava error:", err.response?.data)
    } else {
      console.error("Callback error:", err)
    }
    res.status(500).json({ error: "Authentication failed" })
  }
}
