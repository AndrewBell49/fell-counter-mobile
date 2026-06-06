import { Redirect, Tabs } from "expo-router"
import React, { useContext } from "react"
import { Ionicons } from "@expo/vector-icons"
import { UserContext } from "@/context/UserContext"

export default function TabLayout() {
  const { user } = useContext(UserContext)

  if (!user?.sessionId) {
    return <Redirect href={"/sign-in"} />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name='home-outline' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name='paper-plane-outline' color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
