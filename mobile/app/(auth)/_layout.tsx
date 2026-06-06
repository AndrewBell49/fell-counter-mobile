import React, { useContext } from "react"
import { Redirect, Stack } from "expo-router"
import { UserContext } from "@/context/UserContext"

export default function TabLayout() {
  const { user } = useContext(UserContext)

  if (user?.sessionId) {
    return <Redirect href={"/"} />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
