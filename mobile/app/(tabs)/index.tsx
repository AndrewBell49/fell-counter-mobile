import { useUpdateActivities } from "@/hooks/useUpdateActivities"
import { useEffect } from "react"
import { Text, View } from "react-native"

export default function HomePage() {
  const { trigger, updateDatabaseData, status, error, isReady } =
    useUpdateActivities()

  useEffect(() => {
    trigger()
  }, [])

  useEffect(() => {
    if (status == "completed" && isReady) {
      updateDatabaseData()
    }
  }, [status, isReady])

  return (
    <View>
      <Text>Index screen this screen</Text>
      {!isReady ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text>Status: {status}</Text>
          {error && <Text>Error: {error}</Text>}
        </>
      )}
    </View>
  )
}
