import SafeScreen from "@/components/SafeScreen"
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_600SemiBold,
    Roboto_700Bold,
  })

  if (!fontsLoaded) return <Loading />

  return (
    <SafeScreen>
      <UserProvider>
        <DatabaseProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(app)' />
          </Stack>
        </DatabaseProvider>
      </UserProvider>
    </SafeScreen>
  )
}
