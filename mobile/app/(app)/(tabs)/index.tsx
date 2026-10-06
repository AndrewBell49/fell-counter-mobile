import { useCollapsibleHeader } from "@/components/utils/CollapsibleHeaderContext"
import { Divider } from "@/components/utils/Divider"
import { Text } from "@/components/utils/Text"
import { BagsOverTime } from "@/components/visuals/BagsOverTime"
import { CountryPie } from "@/components/visuals/CountryPie"
import { FellHeightBoxPlot } from "@/components/visuals/FellHeightBoxPlot"
import { COLOURS } from "@/constants/colours"
import { UserContext } from "@/context/UserContext"
import { useContext } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"

export default function BagsScreen() {
  const { user } = useContext(UserContext)
  const { scrollHandler, headerHeightWithInsets } = useCollapsibleHeader()

  return (
    <Animated.ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.container,
        { paddingTop: headerHeightWithInsets + 10 },
      ]}
      onScroll={scrollHandler}
      scrollEventThrottle={16}>
      <Text style={styles.text}>Welcome, {user?.name}</Text>
      <FellHeightBoxPlot />
      <Divider />
      <CountryPie />
      <Divider />
      <BagsOverTime />
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLOURS.background,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 10,
    gap: 10,
  },
  text: {
    display: "flex",
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 28,
  },
})
