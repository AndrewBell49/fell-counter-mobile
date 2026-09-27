import { COLOURS } from "@/constants/colours"
import { IGetFellLocations } from "@/services/db/types"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps"
import Supercluster from "supercluster"
import { Text } from "../utils/Text"

interface FellMapProps {
  data: IGetFellLocations[]
}

type BBox = [number, number, number, number]
type IndividualFellProps = {
  cluster: false
  fellId: string | number
  fell: IGetFellLocations
}
type ClusterProps = { cluster: true; point_count: number; cluster_id: number }
type MapFeatureProps = IndividualFellProps | ClusterProps

const formatDate = (timestamp: string | number) => {
  const date = new Date(Number(timestamp))
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`
}

const getFellDescription = (fell: IGetFellLocations): string => {
  let desc = `${fell.elevation || 0} m`
  const bagDates = fell.bagDates || []

  if (bagDates.length === 0) {
    desc += " (Not Climbed)"
  } else if (bagDates.length === 1) {
    desc += ` • Bagged once, on ${formatDate(bagDates[0])}`
  } else if (bagDates.length === 2) {
    desc += ` • Bagged twice, on ${formatDate(bagDates[0])} & ${formatDate(bagDates[1])}`
  } else if (bagDates.length >= 3) {
    desc += ` • Bagged ${bagDates.length} times, from ${formatDate(bagDates[0])} to ${formatDate(bagDates[bagDates.length - 1])}`
  }

  return desc
}

export function FellMap({ data }: FellMapProps) {
  const mapRef = useRef<MapView>(null)

  const initialRegion: Region = useMemo(() => {
    if (data && data.length > 0) {
      return {
        latitude: data[0].latitude,
        longitude: data[0].longitude,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
      }
    }
    return {
      latitude: 54.45,
      longitude: -3.1,
      latitudeDelta: 0.35,
      longitudeDelta: 0.35,
    }
  }, [data])

  const [region, setRegion] = useState<Region>(initialRegion)
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  const trackingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Smoothly adjust camera bounds whenever classification data updates
  useEffect(() => {
    if (data && data.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
        data.map((f) => ({ latitude: f.latitude, longitude: f.longitude })),
        {
          edgePadding: { top: 140, right: 50, bottom: 50, left: 50 },
          animated: true,
        },
      )
    }
  }, [data])

  useEffect(() => {
    return () => {
      if (trackingTimeout.current) clearTimeout(trackingTimeout.current)
    }
  }, [])

  // 1. GeoJSON conversion
  const points = useMemo(() => {
    return data.map((fell) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        fellId: fell.id,
        fell,
      } as IndividualFellProps,
      geometry: {
        type: "Point" as const,
        coordinates: [fell.longitude, fell.latitude],
      },
    }))
  }, [data])

  // 2. Supercluster initialization
  const index = useMemo(() => {
    const sc = new Supercluster<IndividualFellProps>({
      radius: 50,
      maxZoom: 15,
    })
    sc.load(points)
    return sc
  }, [points])

  // 3. Region conversion
  const zoom = getZoomLevel(region.longitudeDelta)
  const bbox: BBox = [
    region.longitude - region.longitudeDelta / 2,
    region.latitude - region.latitudeDelta / 2,
    region.longitude + region.longitudeDelta / 2,
    region.latitude + region.latitudeDelta / 2,
  ]

  // 4. Visible cluster calculation
  const clusters = useMemo(() => {
    return index.getClusters(bbox, zoom)
  }, [index, bbox, zoom])

  // 5. Region change tracking without LayoutAnimation
  const handleRegionChangeComplete = (newRegion: Region) => {
    setTracksViewChanges(true)
    setRegion(newRegion)

    if (trackingTimeout.current) clearTimeout(trackingTimeout.current)

    trackingTimeout.current = setTimeout(() => {
      setTracksViewChanges(false)
    }, 350)
  }

  // 6. Cluster zoom handler
  const handleClusterPress = (clusterId: number) => {
    const leaves = index.getLeaves(clusterId, Infinity)
    const coordinates = leaves.map((leaf) => ({
      latitude: leaf.geometry.coordinates[1],
      longitude: leaf.geometry.coordinates[0],
    }))

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 120, right: 60, bottom: 60, left: 60 },
      animated: true,
    })
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType='terrain'
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}>
        {clusters.map((item) => {
          const [longitude, latitude] = item.geometry.coordinates
          const properties = item.properties as MapFeatureProps

          // Render Cluster Marker
          if (properties.cluster) {
            // Key includes coordinates & count so native view recycles safely when switching classifications
            const clusterKey = `cluster-${item.id}-${longitude.toFixed(4)}-${latitude.toFixed(4)}-${properties.point_count}`

            return (
              <Marker
                key={clusterKey}
                coordinate={{ latitude, longitude }}
                tracksViewChanges={tracksViewChanges}
                onPress={() => handleClusterPress(properties.cluster_id)}>
                <ClusterMarker count={properties.point_count} />
              </Marker>
            )
          }

          // Render Individual Fell Marker
          const { fell } = properties
          const isClimbed = fell.bagDates && fell.bagDates.length > 0

          return (
            <Marker
              key={`fell-${fell.id}`}
              coordinate={{ latitude, longitude }}
              pinColor={isClimbed ? "green" : "red"}
              title={fell.name}
              description={getFellDescription(fell)}
              tracksViewChanges={tracksViewChanges}
            />
          )
        })}
      </MapView>
    </View>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

const ClusterMarker = React.memo(({ count }: { count: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    scaleAnim.setValue(0.4)
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }, [count])

  return (
    <Animated.View
      style={[
        styles.clusterBadge,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <Text style={styles.clusterText}>{count}</Text>
    </Animated.View>
  )
})

function getZoomLevel(longitudeDelta: number): number {
  return Math.round(Math.log2(360 / (longitudeDelta || 1)))
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  clusterBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLOURS.graph || "#2563EB",
    borderColor: "#FFFFFF",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  clusterText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
})
