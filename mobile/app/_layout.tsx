import { Slot } from "expo-router"
import SafeScreen from "@/components/SafeScreen"
import { UserProvider } from "@/context/UserContext"

export default function RootLayout() {
  return (
    <SafeScreen>
      <UserProvider>
        <Slot />
      </UserProvider>
    </SafeScreen>
  )
}
