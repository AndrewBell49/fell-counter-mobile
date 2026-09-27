import { IGetFellLocations } from "@/services/db/types"
import React from "react"
import { StyleSheet, View } from "react-native"
import { Callout } from "react-native-maps"
import { Text } from "../utils/Text"

const formatDate = (timestamp: string | number): string => {
  const date = new Date(Number(timestamp))
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`
}

const getBaggedCountText = (bagDates?: (string | number)[]): string => {
  const dates = bagDates || []
  if (dates.length === 1) return "Bagged once"
  if (dates.length === 2) return "Bagged 2×"
  return `Bagged ${dates.length}×`
}

const getBaggedDatesSubtext = (bagDates?: (string | number)[]): string => {
  const dates = bagDates || []
  if (dates.length === 1) return formatDate(dates[0])
  if (dates.length === 2)
    return `${formatDate(dates[0])} & ${formatDate(dates[1])}`
  if (dates.length >= 3)
    return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`
  return ""
}

interface FellCalloutProps {
  fell: IGetFellLocations
}

export function FellCallout({ fell }: FellCalloutProps) {
  const isClimbed = Boolean(fell.bagDates && fell.bagDates.length > 0)
  const meters = fell.elevation || 0
  const feet = Math.round(meters * 3.28084)

  return (
    <Callout tooltip style={styles.customCallout}>
      <View style={styles.cardContainer}>
        <Text style={styles.calloutTitle}>{fell.name}</Text>

        <View style={styles.elevationBadge}>
          <Text style={styles.elevationText}>
            {`${meters} m  •  ${feet.toLocaleString()} ft`}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isClimbed ? styles.statusClimbed : styles.statusUnclimbed,
          ]}>
          <Text
            style={[
              styles.statusBadgeText,
              isClimbed ? styles.statusClimbedText : styles.statusUnclimbedText,
            ]}>
            {isClimbed
              ? `✓  ${getBaggedCountText(fell.bagDates)}`
              : "○  Not Climbed"}
          </Text>
        </View>

        {isClimbed && (
          <Text style={styles.dateSubtext}>
            {getBaggedDatesSubtext(fell.bagDates)}
          </Text>
        )}
      </View>

      <View style={styles.calloutArrow} />
    </Callout>
  )
}

const styles = StyleSheet.create({
  customCallout: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    width: 210,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 5,
  },
  elevationBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 7,
  },
  elevationText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  statusClimbed: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
  },
  statusClimbedText: {
    color: "#15803D",
  },
  statusUnclimbed: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
  },
  statusUnclimbedText: {
    color: "#B91C1C",
  },
  dateSubtext: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  calloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
    alignSelf: "center",
  },
})
