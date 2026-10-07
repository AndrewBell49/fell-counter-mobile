import { useCollapsibleHeader } from "@/components/utils/CollapsibleHeaderContext"
import { Divider } from "@/components/utils/Divider"
import { SportPie } from "@/components/visuals/SportPie"
import { COLOURS } from "@/constants/colours"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { DistanceOverTime } from "./visuals/DistanceOverTime"

export default function SportPage() {
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
      <SportPie />
      <Divider />
      <DistanceOverTime />
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
