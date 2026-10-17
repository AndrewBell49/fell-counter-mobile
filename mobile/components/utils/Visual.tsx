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
    borderColor: COLOURS.border,
    borderRadius: 15,
    backgroundColor: COLOURS.card,
    padding: 10,
    marginVertical: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textDecorationLine: "underline",
    marginBottom: 8,
    marginLeft: 5,
  },
})
