import { createDatabaseAdapter } from "@/services/db/createDatabaseAdapter"
import { DatabaseAdapter } from "@/services/db/databaseAdapter"
import { createContext, useEffect, useState } from "react"

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
