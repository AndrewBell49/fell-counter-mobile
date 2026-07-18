import { COLOURS } from "@/constants/colours"
import { StyleSheet, View } from "react-native"

export function Divider() {
  return <View style={sheet.divider} />
}

const sheet = StyleSheet.create({
  divider: {
    height: 2,
    width: "90%",
    alignSelf: "center",
    margin: 4,
    backgroundColor: COLOURS.border,
  },
})
