import SportIcon from "@/components/utils/SportIcon"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { IGetActivityInfo } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native"
import { MiniRouteMap } from "../maps/MiniRouteMap"
import MetricsGrid from "./MetricsGrid"

function formatDateTime(dateValue: string | number): string {
  const num = Number(dateValue)
  const timestamp = !isNaN(num) ? (num < 1e11 ? num * 1000 : num) : dateValue
  const date = new Date(timestamp)

  if (isNaN(date.getTime())) return String(dateValue)

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} at ${hours}:${minutes}`
}

export default function ActivityOverview({
  activityInfo,
}: {
  activityInfo: IGetActivityInfo
}) {
  const handleOpenInStrava = async () => {
    const webUrl = `https://www.strava.com/activities/${activityInfo.id}`

    if (Platform.OS === "web") {
      await Linking.openURL(webUrl)
      return
    }

    try {
      await Linking.openURL(`strava://activities/${activityInfo.id}`)
    } catch {
      await Linking.openURL(webUrl)
    }
  }

  return (
    <View style={styles.container}>
      {/* Title & Sport Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{activityInfo.title}</Text>

        {/* Updated Sport Badge with Strava-style Icon */}
        <View style={styles.sportBadge}>
          <SportIcon
            sport={activityInfo.sport}
            size={14}
            color={COLOURS.primary}
          />
          <Text style={styles.sportText}>{activityInfo.sport}</Text>
        </View>
      </View>

      {/* Start Date & Time */}
      <View style={styles.dateRow}>
        <Ionicons name='calendar-outline' size={16} color={COLOURS.textLight} />
        <Text style={styles.dateText}>
          {formatDateTime(activityInfo.startDate)}
        </Text>
      </View>

      {activityInfo.description ? (
        <View>
          <Text style={styles.description}>{activityInfo.description}</Text>
        </View>
      ) : (
        <></>
      )}

      {activityInfo.summaryPolyline ? (
        <View style={styles.routeMapBox}>
          <MiniRouteMap
            activityId={activityInfo.id}
            summaryPolyline={activityInfo.summaryPolyline}
            peaks={activityInfo.baggedFells.map((fell) => ({
              id: fell.fellId,
              latitude: fell.latitude,
              longitude: fell.longitude,
            }))}
            height={300}
          />
        </View>
      ) : (
        <></>
      )}

      <MetricsGrid activityInfo={activityInfo} />

      <Pressable
        style={({ pressed }) => [
          styles.stravaButton,
          pressed && styles.stravaButtonPressed,
        ]}
        onPress={() => void handleOpenInStrava()}>
        <Ionicons name='open-outline' size={18} color='#fff' />
        <Text style={styles.stravaButtonText}>Open in Strava</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLOURS.text,
    flex: 1,
    marginRight: 10,
  },
  sportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sportText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLOURS.primary,
    textTransform: "capitalize",
  },
  description: {
    fontSize: 12,
    color: COLOURS.text,
    flex: 1,
    marginBottom: 10,
  },
  routeMapBox: {
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  dateText: {
    fontSize: 14,
    color: COLOURS.textLight,
  },
  stravaButton: {
    alignItems: "center",
    backgroundColor: "#FC4C02",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stravaButtonPressed: {
    opacity: 0.8,
  },
  stravaButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
})
