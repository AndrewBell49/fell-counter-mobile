import { createDatabaseAdapter } from "@/services/db/createDatabaseAdapter"
import { DatabaseAdapter } from "@/services/db/databaseAdapter"
import { createContext, useContext, useEffect, useState } from "react"

export const DatabaseContext = createContext<{
  database: DatabaseAdapter | null
  isReady: boolean
}>({ database: null, isReady: false })

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<DatabaseAdapter | null>(null)

  useEffect(() => {
    createDatabaseAdapter().then(setDatabase)
  }, [])

  return (
    <DatabaseContext.Provider value={{ database, isReady: database !== null }}>
      {children}
    </DatabaseContext.Provider>
  )
}

// Non-nullable context: only ever provided once the database is confirmed ready.
export const ReadyDatabaseContext = createContext<DatabaseAdapter | null>(null)

export function ReadyDatabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { database, isReady } = useContext(DatabaseContext)

  if (!isReady || !database) {
    throw new Error(
      "ReadyDatabaseProvider rendered before the database was ready",
    )
  }

  return (
    <ReadyDatabaseContext.Provider value={database}>
      {children}
    </ReadyDatabaseContext.Provider>
  )
}
