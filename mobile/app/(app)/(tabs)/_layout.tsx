import { Loading } from "@/components/utils/Loading"
import { COLOURS } from "@/constants/colours"
import { useUpdateActivities } from "@/hooks/useUpdateActivities"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React, { useEffect } from "react"
import { Image, StyleSheet, Text, View } from "react-native"

export default function TabLayout() {
  const { trigger, updateDatabaseData, status, isOffline, isReady } =
    useUpdateActivities()

  useEffect(() => {
    trigger()
  }, [])

  useEffect(() => {
    if (status === "completed" && isReady) {
      updateDatabaseData()
    }
  }, [status, isReady, updateDatabaseData])

  if (status !== "ready") {
    return (
      <View style={styles.loadingContainer}>
        <Loading message='Syncing your activities...' />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons
            name='cloud-offline-outline'
            size={14}
            color={COLOURS.textLight || "#999"}
          />
          <Text style={styles.offlineText}>
            Offline Mode — Showing saved data
          </Text>
        </View>
      )}

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
          name='sports'
          options={{
            title: "Sports",
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
          name='activities'
          options={{
            title: "Activities",
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require("@/assets/images/compass.png")}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOURS.background,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLOURS.border || "#E5E5E5",
  },
  offlineText: {
    fontSize: 12,
    color: COLOURS.textLight || "#666",
    fontWeight: "500",
  },
})
