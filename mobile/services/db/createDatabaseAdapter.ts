import { Platform } from "react-native"
import { DatabaseAdapter } from "./databaseAdapter"
import { setupDatabase } from "./sqlite/setup"
import { SQLiteAdapter } from "./sqliteAdapter"
import { WebAdapter } from "./webAdapter"

export async function createDatabaseAdapter(): Promise<DatabaseAdapter> {
  if (Platform.OS === "web") {
    return new WebAdapter()
  }

  const sqlite = await setupDatabase()

  return new SQLiteAdapter(sqlite)
}
