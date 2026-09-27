import { COLOURS } from "@/constants/colours"
import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps"
import Supercluster from "supercluster"
import { Text } from "../utils/Text"

// Enable native LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export interface FellPoint {
  id: string
  name: string
  height: number
  latitude: number
  longitude: number
  isClimbed: boolean
}

interface FellMapProps {
  data: FellPoint[]
}

type BBox = [number, number, number, number]
type IndividualFellProps = { cluster: false; fellId: string; fell: FellPoint }
type ClusterProps = { cluster: true; point_count: number; cluster_id: number }
type MapFeatureProps = IndividualFellProps | ClusterProps

const INITIAL_REGION: Region = {
  latitude: 54.45,
  longitude: -3.1,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
}

export function FellMap({ data }: FellMapProps) {
  const mapRef = useRef<MapView>(null)
  const [region, setRegion] = useState<Region>(INITIAL_REGION)

  // Tracks view changes dynamically to allow smooth rendering during map movements
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  // ReturnType<typeof setTimeout> fixes the TypeScript 'Timeout' vs 'number' mismatch
  const trackingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (trackingTimeout.current) {
        clearTimeout(trackingTimeout.current)
      }
    }
  }, [])

  // 1. Convert FellPoint data to GeoJSON for supercluster
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

  // 2. Initialize supercluster instance
  const index = useMemo(() => {
    const sc = new Supercluster<IndividualFellProps>({
      radius: 50,
      maxZoom: 15,
    })
    sc.load(points)
    return sc
  }, [points])

  // 3. Convert region to bounding box & zoom level
  const zoom = getZoomLevel(region.longitudeDelta)
  const bbox: BBox = [
    region.longitude - region.longitudeDelta / 2,
    region.latitude - region.latitudeDelta / 2,
    region.longitude + region.longitudeDelta / 2,
    region.latitude + region.latitudeDelta / 2,
  ]

  // 4. Retrieve visible clusters and single points
  const clusters = useMemo(() => {
    return index.getClusters(bbox, zoom)
  }, [index, bbox, zoom])

  // 5. Smoothly handle region changes with animations & anti-flicker timer
  const handleRegionChangeComplete = (newRegion: Region) => {
    setTracksViewChanges(true)

    // Configure layout transition for cluster merges/splits
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setRegion(newRegion)

    if (trackingTimeout.current) {
      clearTimeout(trackingTimeout.current)
    }

    // Lock marker view changes 350ms after pan/zoom stops to freeze performance flickering
    trackingTimeout.current = setTimeout(() => {
      setTracksViewChanges(false)
    }, 350)
  }

  // 6. Zoom to fit all fells within a tapped cluster
  const handleClusterPress = (clusterId: number) => {
    const leaves = index.getLeaves(clusterId, Infinity)
    const coordinates = leaves.map((leaf) => ({
      latitude: leaf.geometry.coordinates[1],
      longitude: leaf.geometry.coordinates[0],
    }))

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
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
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}>
        {clusters.map((item) => {
          const [longitude, latitude] = item.geometry.coordinates
          const properties = item.properties as MapFeatureProps

          // Render Cluster Pin
          if (properties.cluster) {
            return (
              <Marker
                key={`cluster-${item.id}`}
                coordinate={{ latitude, longitude }}
                tracksViewChanges={tracksViewChanges}
                onPress={() => handleClusterPress(properties.cluster_id)}>
                <ClusterMarker count={properties.point_count} />
              </Marker>
            )
          }

          // Render Native Fell Pin
          const { fell } = properties
          return (
            <Marker
              key={`fell-${fell.id}`}
              coordinate={{ latitude, longitude }}
              pinColor={fell.isClimbed ? "green" : "red"}
              title={fell.name}
              description={`Elevation: ${fell.height}m (${fell.isClimbed ? "Climbed" : "Not Climbed"})`}
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

/**
 * Cluster badge featuring a spring scale pop animation on creation/count change.
 */
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

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

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
