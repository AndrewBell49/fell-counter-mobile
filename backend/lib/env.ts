import dotenv from "dotenv"

dotenv.config()

function requireEnvVar(key: string) {
  const value = process.env[key]
  if (!value) {
    throw Error(`${key} is a required environment variable, but not found`)
  }
  return value
}

export const ENV = Object.freeze({
  clientId: requireEnvVar("CLIENT_ID"),
  clientSecret: requireEnvVar("CLIENT_SECRET"),
  databaseUrl: requireEnvVar("DATABASE_URL"),
  encryptionKey: requireEnvVar("ENCRYPTION_KEY"),
  serverUrl: requireEnvVar("SERVER_URL"),
  seedDbFileName: requireEnvVar("SEED_DB_FILE_NAME"),
  webCallbackUrl: requireEnvVar("WEB_CALLBACK_URL"),
})
