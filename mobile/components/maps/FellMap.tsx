import { COLOURS } from "@/constants/colours"
import React, { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import MapView from "react-native-map-clustering"
import { Marker, Region } from "react-native-maps"
import { Loading } from "../utils/Loading"
import { Text } from "../utils/Text"

export interface FellPoint {
  id?: string
  name: string
  height: number
  latitude: number
  longitude: number
  isClimbed?: boolean
}

interface FellMapProps {
  data: FellPoint[] | null
  initialRegion?: Region
}

export function FellMap({ data, initialRegion }: FellMapProps) {
  const computedRegion = useMemo(() => {
    if (initialRegion) return initialRegion
    if (!data || data.length === 0) {
      return {
        latitude: 54.4542,
        longitude: -3.2132,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    }

    const lats = data.map((p) => p.latitude)
    const lons = data.map((p) => p.longitude)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.05),
      longitudeDelta: Math.max((maxLon - minLon) * 1.4, 0.05),
    }
  }, [data, initialRegion])

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          mapType='terrain'
          region={computedRegion}
          animationEnabled={false}
          renderCluster={(cluster) => {
            const { id, geometry, properties } = cluster
            const count = properties.point_count

            return (
              <Marker
                key={`cluster-${id}`}
                coordinate={{
                  longitude: geometry.coordinates[0],
                  latitude: geometry.coordinates[1],
                }}
                onPress={properties.onPress}
                tracksViewChanges={false}>
                {/* Padding buffer prevents edge clipping */}
                <View style={styles.clusterWrapper}>
                  <View style={styles.clusterBadge}>
                    <Text style={styles.clusterText}>{count}</Text>
                  </View>
                </View>
              </Marker>
            )
          }}>
          {data.map((fell, index) => {
            const isClimbed = Boolean(fell.isClimbed)
            const key = fell.id ?? `${fell.name}-${index}`

            return (
              <Marker
                key={key}
                coordinate={{
                  latitude: fell.latitude,
                  longitude: fell.longitude,
                }}
                title={`${fell.name} (${Math.round(fell.height)}m)`}
                description={isClimbed ? "Climbed ✓" : "Unclimbed ▲"}
                pinColor={isClimbed ? "green" : "red"}
              />
            )
          })}
        </MapView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  clusterWrapper: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clusterBadge: {
    backgroundColor: COLOURS.graph ?? "#2563EB",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clusterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
})
