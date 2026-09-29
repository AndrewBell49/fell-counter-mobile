import { Loading } from "@/components/utils/Loading"
import { COLOURS } from "@/constants/colours"
import { useUpdateActivities } from "@/hooks/useUpdateActivities"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React, { useEffect } from "react"
import { Image, StyleSheet, Text, View } from "react-native"

export default function TabLayout() {
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

  // Show loading while activities sync
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLOURS.background,
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
  errorText: {
    fontSize: 16,
    color: COLOURS.pop,
    textAlign: "center",
    paddingHorizontal: 24,
  },
})
