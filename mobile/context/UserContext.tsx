import { deleteItem, getItem, saveItem } from "@/services/storage/storage"
import { SERVER_URL } from "@/services/strava/constants"
import { createContext, useEffect, useRef, useState } from "react"

export const UserContext = createContext<{
  user: null | User
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  getHeaders: () => Record<string, string>
}>({
  user: null,
  setUser: () => {},
  getHeaders: () => ({}),
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const hasLoaded = useRef(false)

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(user ? { "x-session-id": user.sessionId } : {}),
    }
  }

  useEffect(() => {
    async function loadSession() {
      const sessionId = await getItem("sessionId")
      const name = await getItem("name")
      if (sessionId && name) {
        setUser({ sessionId, name })
      }
      hasLoaded.current = true
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (!user) return

    async function validateSession() {
      const res = await fetch(`${SERVER_URL}/strava/user`, {
        headers: getHeaders(),
      })

      if (res.status === 401) {
        setUser(null)
      }
    }

    validateSession()
  }, [user?.sessionId])

  useEffect(() => {
    if (user) {
      saveItem("sessionId", user.sessionId)
      saveItem("name", user.name)
    } else if (hasLoaded.current) {
      deleteItem("sessionId")
      deleteItem("name")
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser, getHeaders }}>
      {children}
    </UserContext.Provider>
  )
}
