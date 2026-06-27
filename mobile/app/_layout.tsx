import SafeScreen from "@/components/SafeScreen"
import { DatabaseProvider } from "@/context/DatabaseContext"
import { UserProvider } from "@/context/UserContext"
import { Slot } from "expo-router"

export default function RootLayout() {
  return (
    <SafeScreen>
      <UserProvider>
        <DatabaseProvider>
          <Slot />
        </DatabaseProvider>
      </UserProvider>
    </SafeScreen>
  )
}
