import { createDatabaseAdapter } from "@/services/db/createDatabaseAdapter"
import { DatabaseAdapter } from "@/services/db/databaseAdapter"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

type DatabaseContextValue = {
  database: DatabaseAdapter | null
  isReady: boolean
  error: Error | null
  retryDatabase: () => Promise<void>
}

export const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  isReady: false,
  error: null,
  retryDatabase: async () => {},
})

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<DatabaseAdapter | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const initialiseDatabase = useCallback(async () => {
    setDatabase(null)
    setError(null)

    try {
      const adapter = await createDatabaseAdapter()
      setDatabase(adapter)
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Unable to initialise the local database"),
      )
    }
  }, [])

  useEffect(() => {
    void initialiseDatabase()
  }, [initialiseDatabase])

  return (
    <DatabaseContext.Provider
      value={{
        database,
        isReady: database !== null,
        error,
        retryDatabase: initialiseDatabase,
      }}>
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
