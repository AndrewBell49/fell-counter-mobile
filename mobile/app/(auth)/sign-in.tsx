import { UserContext } from "@/context/UserContext"
import { useApi } from "@/hooks/useApi"
import { SERVER_URL } from "@/services/strava/constants"
import { Redirect, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useContext, useEffect, useState } from "react"
import { Button, Platform, Text, View } from "react-native"

export default function SignInScreen() {
  const { user, setUser } = useContext(UserContext)
  const { sessionId, name } = useLocalSearchParams()
  const [error, setError] = useState("")
  const { request } = useApi()

  async function handleLogin() {
    setError("")
    try {
      const res = await request<{ url: string }>({
        url: `${SERVER_URL}/auth/url?platform=${Platform.OS === "web" ? "web" : "mobile"}`,
      })

      if (Platform.OS === "web") {
        window.location.href = res.url // full redirect on web
      } else {
        await WebBrowser.openAuthSessionAsync(res.url, "fellcounter://callback")
      }
    } catch (err) {
      console.error(err)
      setError("Login failed")
    }
  }

  useEffect(() => {
    if (sessionId) {
      setUser({
        sessionId: sessionId as string,
        name: name as string,
      })
    }
  }, [sessionId])

  if (user) return <Redirect href={"/"} />

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {error && <Text>Error: {error}</Text>}
      <Button title='Login with Strava' onPress={handleLogin} />
    </View>
  )
}
