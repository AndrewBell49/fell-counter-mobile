import { FellMap, FellPoint } from "@/components/maps/FellMap"
import React from "react"
import { StyleSheet, View } from "react-native"

export default function MapScreen() {
  const points: FellPoint[] = Array.from({ length: 20 }, (_, i) => ({
    id: i.toString(),
    name: `Fell ${i + 1}`,
    height: Math.floor(Math.random() * 1000) + 100,
    latitude: 54.45 + (Math.random() - 0.5) * 0.2,
    longitude: -3.21 + (Math.random() - 0.5) * 0.2,
    isClimbed: i % 2 === 0,
  }))

  return (
    <View style={styles.screen}>
      <FellMap data={points} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
})
