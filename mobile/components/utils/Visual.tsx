import { COLOURS } from "@/constants/colours"
import { ReactNode } from "react"
import { StyleSheet, View } from "react-native"
import { Text } from "./Text"

export function Visual({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <>{children}</>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    borderBlockColor: COLOURS.border,
    padding: 6,
    marginVertical: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
})
