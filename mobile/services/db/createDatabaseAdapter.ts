import { Platform } from "react-native"
import { DatabaseAdapter } from "./databaseAdapter"
import { setupDatabase } from "./sqlite/setup"
import { SQLiteAdapter } from "./sqliteAdapter"

export async function createDatabaseAdapter(): Promise<DatabaseAdapter> {
  if (Platform.OS === "web") {
    throw Error("Web implementation of database adapter not created")
  }

  const sqlite = await setupDatabase()

  return new SQLiteAdapter(sqlite)
}
