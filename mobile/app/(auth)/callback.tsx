import { Redirect, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"

WebBrowser.maybeCompleteAuthSession()

export default function CallbackScreen() {
  const { sessionId, name } = useLocalSearchParams()

  if (!sessionId) return <Redirect href='/sign-in' />

  return <Redirect href={`/sign-in?sessionId=${sessionId}&name=${name}`} />
}
