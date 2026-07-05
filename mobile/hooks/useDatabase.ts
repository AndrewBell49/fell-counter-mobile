import { ReadyDatabaseContext } from "@/context/DatabaseContext"
import { DatabaseAdapter } from "@/services/db/databaseAdapter"
import { useContext } from "react"

export function useDatabase(): DatabaseAdapter {
  const database = useContext(ReadyDatabaseContext)

  if (!database) {
    throw new Error("useDatabase must be called within a ReadyDatabaseProvider")
  }

  return database
}
