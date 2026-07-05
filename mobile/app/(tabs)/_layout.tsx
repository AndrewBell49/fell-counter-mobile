import { Loading } from "@/components/utils/Loading"
import { COLOURS } from "@/constants/colours"
import { ReadyDatabaseProvider } from "@/context/DatabaseContext"
import { UserContext } from "@/context/UserContext"
import { useUpdateActivities } from "@/hooks/useUpdateActivities"
import { Ionicons } from "@expo/vector-icons"
import { Redirect, Tabs } from "expo-router"
import React, { useContext, useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"

export default function TabLayout() {
  const { user } = useContext(UserContext)

  const { trigger, updateDatabaseData, status, error, isReady } =
    useUpdateActivities()

  useEffect(() => {
    trigger()
  }, [])

  useEffect(() => {
    if (status === "completed" && isReady) {
      updateDatabaseData()
    }
  }, [status, isReady])

  if (!user?.sessionId) {
    return <Redirect href={"/sign-in"} />
  }

  if (status !== "ready") {
    return (
      <View style={styles.loadingContainer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Loading message='Loading your bags...' />
        )}
      </View>
    )
  }

  return (
    <ReadyDatabaseProvider>
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
    </ReadyDatabaseProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLOURS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLOURS.text,
  },
  errorText: {
    fontSize: 16,
    color: COLOURS.expense,
    textAlign: "center",
    paddingHorizontal: 24,
  },
})
