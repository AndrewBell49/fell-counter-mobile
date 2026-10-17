import { COLOURS } from "@/constants/colours"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

interface DividerProps {
  style?: StyleProp<ViewStyle>
}

export function Divider({ style }: DividerProps) {
  return <View style={[sheet.divider, style]} />
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
