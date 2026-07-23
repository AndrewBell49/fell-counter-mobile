import { Loading } from "@/components/utils/Loading"
import { COLOURS } from "@/constants/colours"
import { ReadyDatabaseProvider } from "@/context/DatabaseContext"
import { UserContext } from "@/context/UserContext"
import { useUpdateActivities } from "@/hooks/useUpdateActivities"
import { Ionicons } from "@expo/vector-icons"
import { Redirect, Tabs } from "expo-router"
import React, { useContext, useEffect } from "react"
import { Image, StyleSheet, Text, View } from "react-native"

export default function TabLayout() {
  const { user } = useContext(UserContext)
  const { trigger, updateDatabaseData, status, error, isReady } =
    useUpdateActivities()

  useEffect(() => {
    trigger()
  }, [])

  useEffect(() => {
    console.log(`Status: ${status} - isReady: ${isReady}`)
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
          tabBarStyle: {
            backgroundColor: COLOURS.background, // dark background for the bar itself
            borderTopColor: COLOURS.border,
          },
          tabBarActiveTintColor: COLOURS.pop,
          tabBarInactiveTintColor: COLOURS.textLight,
        }}>
        <Tabs.Screen
          name='index'
          options={{
            title: "Bags",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("@/assets/images/mountains.png")}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode='contain'
              />
            ),
          }}
        />
        <Tabs.Screen
          name='activities'
          options={{
            title: "Activities",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("@/assets/images/running.png")}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode='contain'
              />
            ),
          }}
        />
        <Tabs.Screen
          name='map'
          options={{
            title: "Map",
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name='map' color={color} />
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
    color: COLOURS.pop,
    textAlign: "center",
    paddingHorizontal: 24,
  },
})
