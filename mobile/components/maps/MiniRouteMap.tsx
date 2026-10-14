import { COLOURS } from "@/constants/colours"
import polyline from "@mapbox/polyline"
import React from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Polyline } from "react-native-maps"

export const MiniRouteMap = ({
  summaryPolyline,
}: {
  summaryPolyline: string
}) => {
  if (!summaryPolyline) return null

  const coordinates = polyline
    .decode(summaryPolyline)
    .map(([latitude, longitude]) => ({
      latitude,
      longitude,
    }))

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}>
        <Polyline
          coordinates={coordinates}
          strokeColor={COLOURS.pop}
          strokeWidth={3}
        />
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { height: 120, width: 120, borderRadius: 8, overflow: "hidden" },
  map: { ...StyleSheet.absoluteFillObject },
})
