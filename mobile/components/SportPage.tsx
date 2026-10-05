import { Divider } from "@/components/utils/Divider"
import { SportPie } from "@/components/visuals/SportPie"
import { COLOURS } from "@/constants/colours"
import { ScrollView, StyleSheet, Text } from "react-native"
import { DistanceOverTime } from "./visuals/DistanceOverTime"

export default function SportPage() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>View sport data</Text>
      <SportPie />
      <Divider />
      <DistanceOverTime />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 10,
    gap: 10,
    backgroundColor: COLOURS.background,
  },
  text: {
    display: "flex",
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 28,
  },
})
