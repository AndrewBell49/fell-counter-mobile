import { useUpdateActivities } from "@/hooks/useUpdateActivities"
import { useEffect } from "react"
import { Text, View } from "react-native"

export default function HomePage() {
  const { trigger, updateDatabaseData, status, error } = useUpdateActivities()

  useEffect(() => {
    trigger()
  }, [])

  useEffect(() => {
    if (status == "completed") {
      updateDatabaseData()
    }
  }, [status])
  return (
    <View>
      <Text>Index screen this screen</Text>
      <Text>Status: {status}</Text>
      {error && <Text>Error: {error}</Text>}
    </View>
  )
}
