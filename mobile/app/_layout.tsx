import { Loading } from "@/components/utils/Loading"
import { DatabaseProvider } from "@/context/DatabaseContext"
import { UserProvider } from "@/context/UserContext"
import {
  Roboto_400Regular,
  Roboto_600SemiBold,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto"
import { Stack } from "expo-router"
import { StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_600SemiBold,
    Roboto_700Bold,
  })

  if (!fontsLoaded) return <Loading />

  return (
    <GestureHandlerRootView style={styles.container}>
      <UserProvider>
        <DatabaseProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(app)' />
          </Stack>
        </DatabaseProvider>
      </UserProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
