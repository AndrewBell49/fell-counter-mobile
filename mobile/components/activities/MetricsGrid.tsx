import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { M_S_TO_KM_H, M_S_TO_MIN_KM, M_TO_FT } from "@/constants/constants"
import { IGetActivityInfo } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, View } from "react-native"

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}h ${m}m`
  }
  return `${m}m ${s}s`
}

function formatSpeed(speed: number, sport: string): string {
  if (sport === "Run" || sport === "Walk" || sport === "Hike") {
    const pace = M_S_TO_MIN_KM / speed
    const pace_min = Math.floor(pace)
    const pace_sec = Math.floor((pace - pace_min) * 60)
    const paddedSec = pace_sec < 10 ? `0${pace_sec}` : pace_sec
    return `${pace_min}:${paddedSec} /km`
  }
  return `${Math.round(speed * M_S_TO_KM_H)} km/h`
}

export default function MetricsGrid({
  activityInfo,
}: {
  activityInfo: IGetActivityInfo
}) {
  const distanceKm = (activityInfo.distance / 1000).toFixed(2)
  const elevationFt = Math.round(activityInfo.elevationGain * M_TO_FT)

  const hasSpeed = Boolean(
    activityInfo.averageSpeed &&
    activityInfo.averageSpeed > 0 &&
    activityInfo.maxSpeed &&
    activityInfo.maxSpeed > 0,
  )

  const distanceCard = (
    <View style={styles.statCard}>
      <Ionicons name='map-outline' size={20} color={COLOURS.primary} />
      <Text style={styles.statValue}>{distanceKm} km</Text>
      <Text style={styles.statLabel}>Distance</Text>
    </View>
  )

  const timeCard = (
    <View style={styles.statCard}>
      <Ionicons name='time-outline' size={20} color={COLOURS.primary} />
      <Text style={styles.statValue}>
        {formatDuration(activityInfo.movingTime)}
      </Text>
      <Text style={styles.statLabel}>Moving time</Text>
      <Text style={styles.statSubValue}>
        ({formatDuration(activityInfo.elapsedTime)})
      </Text>
      <Text style={styles.statLabel}>Elapsed time</Text>
    </View>
  )

  const elevationCard = (
    <View style={styles.statCard}>
      <Ionicons name='trending-up-outline' size={20} color={COLOURS.primary} />
      <Text style={styles.statValue}>{activityInfo.elevationGain}m</Text>
      <Text style={styles.statSubValue}>({elevationFt} ft)</Text>
      <Text style={styles.statLabel}>Elevation Gain</Text>
    </View>
  )

  const speedCard = hasSpeed ? (
    <View style={styles.statCard}>
      <Ionicons name='speedometer-outline' size={20} color={COLOURS.primary} />
      <Text style={styles.statValue}>
        {formatSpeed(activityInfo.averageSpeed!, activityInfo.sport)}
      </Text>
      <Text style={styles.statLabel}>Avg Speed</Text>
      <Text style={styles.statValue}>
        {formatSpeed(activityInfo.maxSpeed!, activityInfo.sport)}
      </Text>
      <Text style={styles.statLabel}>Max Speed</Text>
    </View>
  ) : null

  return (
    <View style={styles.container}>
      {hasSpeed ? (
        <>
          <View style={styles.row}>
            {distanceCard}
            {elevationCard}
          </View>
          <View style={styles.row}>
            {timeCard}
            {speedCard}
          </View>
        </>
      ) : (
        <View style={styles.row}>
          {distanceCard}
          {timeCard}
          {elevationCard}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",

    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginTop: 6,
  },
  statSubValue: {
    fontSize: 12,
    color: COLOURS.textLight,
    marginTop: 1,
  },
  statLabel: {
    fontSize: 11,
    color: COLOURS.textLight,
    marginTop: 4,
    textAlign: "center",
  },
})
