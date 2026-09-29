import { COLOURS } from "@/constants/colours"
import { IGetFellInfo } from "@/services/db/types"
import React from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Marker } from "react-native-maps"

export default function TerrainMap({ fellInfo }: { fellInfo: IGetFellInfo }) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType='terrain'
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        initialRegion={{
          latitude: fellInfo.latitude,
          longitude: fellInfo.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}>
        <Marker
          coordinate={{
            latitude: fellInfo.latitude,
            longitude: fellInfo.longitude,
          }}
          title={fellInfo.name}
          description={`${fellInfo.elevation}m summit`}
          pinColor={fellInfo.bags.length > 0 ? "green" : "red"}
        />
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 28,
  },
  map: {
    width: "100%",
    height: "100%",
  },
})
