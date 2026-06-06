import crypto from "crypto"
import { ENCRYPTION_ALGORITHM } from "./constants"
import { ENV } from "../lib/env"

export function encrypt(plainText: string) {
  const iv = crypto.randomBytes(12).toString("base64")
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENV.encryptionKey, "base64"),
    Buffer.from(iv, "base64"),
  )
  let cipherText = cipher.update(plainText, "utf8", "base64")
  cipherText += cipher.final("base64")
  const tag = cipher.getAuthTag().toString("base64")

  return { cipherText, tag, iv }
}

export function decrypt(cipherText: string, tag: string, iv: string) {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENV.encryptionKey, "base64"),
    Buffer.from(iv, "base64"),
  )

  decipher.setAuthTag(Buffer.from(tag, "base64"))

  let plainText = decipher.update(cipherText, "base64", "utf8")
  plainText += decipher.final("utf8")

  return plainText
}
