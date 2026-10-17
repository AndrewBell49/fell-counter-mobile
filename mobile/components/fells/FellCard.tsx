import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { M_TO_FT } from "@/constants/constants"
import { IGetPopularFells } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"

interface FellCardProps {
  item: IGetPopularFells
  rank: number
  isTied?: boolean
}

export const FellCard = React.memo(({ item, rank, isTied }: FellCardProps) => {
  const elevationMeters = item.elevation
  const elevationFeet = Math.round(elevationMeters * M_TO_FT)

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() =>
        router.push({
          pathname: "/fells/[id]",
          params: { id: item.id },
        })
      }>
      <View style={styles.cardContent}>
        {/* Left Column: Rank Badge & Main Information */}
        <View style={styles.leftCol}>
          <View style={styles.titleRow}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>
                {isTied ? `=${rank}` : `#${rank}`}
              </Text>
            </View>

            <Text style={styles.fellName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons
                name='trending-up-outline'
                size={12}
                color={COLOURS.textLight}
              />
              <Text style={styles.statText}>
                {elevationMeters}m ({elevationFeet}ft)
              </Text>
            </View>
          </View>
        </View>

        {/* Right Column: Count Badge */}
        <View style={styles.rightCol}>
          <View style={styles.fellBadge}>
            <Ionicons name='triangle' size={11} color={COLOURS.pop} />
            <Text style={styles.fellBadgeText}>
              {item.count} {item.count === 1 ? "time" : "times"}
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
    backgroundColor: COLOURS.cardSecondary,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 28,
    marginBottom: 8,
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
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  rankBadge: {
    backgroundColor: COLOURS.background,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.primary,
  },
  fellName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    flex: 1,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLOURS.textLight,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  fellBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLOURS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderColor: COLOURS.border,
    borderWidth: 1,
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
