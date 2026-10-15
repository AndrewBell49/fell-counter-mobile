import SportIcon from "@/components/utils/SportIcon"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { IActivityListItem } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { RouteOutline } from "../maps/RouteOutline"
import { formatDate, formatDuration } from "./utils"

interface ActivityCardProps {
  item: IActivityListItem
}

export const ActivityCard = React.memo(({ item }: ActivityCardProps) => {
  const distanceKm = (item.distance / 1000).toFixed(2)
  const fellsCount = item.fellsCount ?? 0

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() =>
        router.push({
          pathname: "/activities/[id]",
          params: { id: item.id },
        })
      }>
      <View style={styles.cardContent}>
        {/* Left Column: Main Information */}
        <View style={styles.leftCol}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons
                name='map-outline'
                size={12}
                color={COLOURS.textLight}
              />
              <Text style={styles.statText}>{distanceKm} km</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons
                name='time-outline'
                size={12}
                color={COLOURS.textLight}
              />
              <Text style={styles.statText}>
                {formatDuration(item.movingTime)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons
                name='trending-up-outline'
                size={12}
                color={COLOURS.textLight}
              />
              <Text style={styles.statText}>{item.elevationGain}m</Text>
            </View>
          </View>
        </View>

        {/* Middle Column: Route Outline */}
        <View style={styles.outlineCol}>
          <RouteOutline
            summaryPolyline={item.summaryPolyline}
            height={46}
            aspectRatio={1}
            strokeWidth={2.5}
          />
        </View>

        {/* Right Column: Sport Badge & Fells Bagged */}
        <View style={styles.rightCol}>
          <View style={styles.sportBadge}>
            <SportIcon sport={item.sport} size={12} color={COLOURS.primary} />
            <Text style={styles.sportText}>{item.sport}</Text>
          </View>

          <View style={styles.fellBadge}>
            <Ionicons name='triangle' size={11} color={COLOURS.graph} />
            <Text style={styles.fellBadgeText}>
              {fellsCount} {fellsCount === 1 ? "fell" : "fells"}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name='chevron-forward'
        size={16}
        color={COLOURS.textLight}
        style={styles.chevron}
      />
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 28,
    marginBottom: 12,
    position: "relative",
    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftCol: {
    flex: 1,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: COLOURS.textLight,
    marginBottom: 6,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLOURS.text,
  },
  outlineCol: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  sportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLOURS.background,
    borderColor: COLOURS.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sportText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLOURS.primary,
    textTransform: "capitalize",
  },
  fellBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLOURS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fellBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLOURS.text,
  },
  chevron: {
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -8,
  },
})
