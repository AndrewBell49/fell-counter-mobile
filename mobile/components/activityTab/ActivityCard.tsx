import SportIcon from "@/components/utils/SportIcon"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { IActivityListItem } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
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
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.sportBadge}>
          <SportIcon sport={item.sport} size={12} color={COLOURS.primary} />
          <Text style={styles.sportText}>{item.sport}</Text>
        </View>
      </View>

      <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>

      <View style={styles.cardBody}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name='map-outline' size={14} color={COLOURS.textLight} />
            <Text style={styles.statText}>{distanceKm} km</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name='time-outline' size={14} color={COLOURS.textLight} />
            <Text style={styles.statText}>
              {formatDuration(item.movingTime)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons
              name='trending-up-outline'
              size={14}
              color={COLOURS.textLight}
            />
            <Text style={styles.statText}>{item.elevationGain}m</Text>
          </View>
        </View>

        <View style={styles.fellBadge}>
          <Ionicons name='triangle' size={12} color={COLOURS.graph} />
          <Text style={styles.fellBadgeText}>
            {fellsCount} {fellsCount === 1 ? "fell" : "fells"} bagged
          </Text>
        </View>
      </View>

      <Ionicons
        name='chevron-forward'
        size={18}
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
    padding: 14,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    flex: 1,
    marginRight: 8,
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
  dateText: {
    fontSize: 13,
    color: COLOURS.textLight,
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLOURS.text,
  },
  fellBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLOURS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fellBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLOURS.text,
  },
  chevron: {
    position: "absolute",
    right: 12,
    top: 16,
  },
})
