import { Loading } from "@/components/utils/Loading"
import { COLOURS } from "@/constants/colours"
import {
  DatabaseContext,
  ReadyDatabaseProvider,
} from "@/context/DatabaseContext"
import { UserContext } from "@/context/UserContext"
import { Redirect, Stack } from "expo-router"
import React, { useContext } from "react"
import { Button, StyleSheet, Text, View } from "react-native"

export default function AppLayout() {
  const { user } = useContext(UserContext)
  const { isReady, error, retryDatabase } = useContext(DatabaseContext)

  if (!user?.sessionId) {
    return <Redirect href='/sign-in' />
  }

  if (!isReady) {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Your offline data is unavailable</Text>
          <Text style={styles.errorMessage}>
            We could not prepare the local database. Please try again.
          </Text>
          <Button title='Try again' onPress={() => void retryDatabase()} />
        </View>
      )
    }

    return (
      <View style={styles.loadingContainer}>
        <Loading message='Preparing your offline data...' />
      </View>
    )
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOURS.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: COLOURS.background,
  },
  errorTitle: {
    color: COLOURS.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  errorMessage: {
    color: COLOURS.textLight,
    fontSize: 15,
    textAlign: "center",
  },
})
