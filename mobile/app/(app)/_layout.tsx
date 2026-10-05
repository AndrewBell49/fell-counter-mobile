import { ReadyDatabaseProvider } from "@/context/DatabaseContext"
import { UserContext } from "@/context/UserContext"
import { Redirect, Stack } from "expo-router"
import React, { useContext } from "react"

export default function AppLayout() {
  const { user } = useContext(UserContext)

  if (!user?.sessionId) {
    return <Redirect href='/sign-in' />
  }

  return (
    <ReadyDatabaseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
        <Stack.Screen
          name='fells/[id]'
          options={{
            headerShown: true,
            title: "Fell Details",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name='activities/[id]'
          options={{
            headerShown: true,
            title: "Activity Details",
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </ReadyDatabaseProvider>
  )
}
