import { Divider } from "@/components/utils/Divider"
import { Text } from "@/components/utils/Text"
import { BagsOverTime } from "@/components/visuals/BagsOverTime"
import { CountryPie } from "@/components/visuals/CountryPie"
import { FellHeightBoxPlot } from "@/components/visuals/FellHeightBoxPlot"
import { COLOURS } from "@/constants/colours"
import { UserContext } from "@/context/UserContext"
import { useContext } from "react"
import { ScrollView, StyleSheet } from "react-native"

export default function BagsScreen() {
  const { user } = useContext(UserContext)

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>Welcome, {user?.name}</Text>
      <FellHeightBoxPlot />
      <Divider />
      <CountryPie />
      <Divider />
      <BagsOverTime />
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
