import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { IActivityBaggedFell } from "@/services/db/types"
import {
  openDetail,
  type DetailDestination,
} from "@/services/navigation/detailNavigation"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Alert, Pressable, StyleSheet, View } from "react-native"

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function ActivityFellsList({
  baggedFells,
  onRemoveBag,
  activityId,
  detailDepth,
}: {
  baggedFells: IActivityBaggedFell[]
  onRemoveBag: (bagId: number) => void
  activityId: number
  detailDepth: number
}) {
  // Count total occurrences of each fellId in this activity list
  const totalCounts = baggedFells.reduce<Record<number, number>>((acc, bag) => {
    acc[bag.fellId] = (acc[bag.fellId] || 0) + 1
    return acc
  }, {})

  const handleRemovePress = (bag: IActivityBaggedFell) => {
    Alert.alert(
      "Remove Bag",
      `Are you sure you want to remove this bag for ${bag.fellName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onRemoveBag(bag.bagId),
        },
      ],
    )
  }

  const currentActivity: DetailDestination = {
    pathname: "/activities/[id]",
    params: { id: activityId },
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Bagged Fells ({baggedFells.length})
      </Text>

      {baggedFells && baggedFells.length > 0 ? (
        baggedFells.map((bag) => {
          const isMultiple = (totalCounts[bag.fellId] || 0) > 1

          return (
            <Pressable
              key={bag.bagId}
              style={({ pressed }) => [
                styles.fellCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                openDetail(
                  currentActivity,
                  {
                    pathname: "/fells/[id]",
                    params: { id: bag.fellId },
                  },
                  detailDepth,
                )
              }>
              <Ionicons
                name='triangle'
                size={20}
                color={COLOURS.graph}
                style={styles.fellIcon}
              />

              <View style={styles.fellDetails}>
                <Text style={styles.fellTitle}>{bag.fellName}</Text>
                <Text style={styles.bagOccurrenceText}>
                  {isMultiple
                    ? `${getOrdinalSuffix(bag.bagOccurrence)} bag of this fell for this activity • ${bag.elevation}m`
                    : `${bag.elevation}m`}
                </Text>
              </View>

              {/* Remove Bag Button */}
              <Pressable
                hitSlop={12}
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation()
                  handleRemovePress(bag)
                }}>
                <Ionicons name='trash-outline' size={20} color='#e53935' />
              </Pressable>
            </Pressable>
          )
        })
      ) : (
        <Text style={styles.emptyText}>No fells bagged on this activity</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  fellCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,

    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  fellIcon: {
    marginRight: 12,
  },
  fellDetails: {
    flex: 1,
  },
  fellTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLOURS.text,
  },
  bagOccurrenceText: {
    fontSize: 13,
    color: COLOURS.textLight,
    marginTop: 2,
  },
  removeButton: {
    padding: 6,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLOURS.textLight,
    fontStyle: "italic",
  },
})
