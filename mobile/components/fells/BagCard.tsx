import SportIcon from "@/components/utils/SportIcon"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { IGetFellInfo } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"

function formatDate(dateValue: string | number): string {
  const num = Number(dateValue)
  const timestamp = !isNaN(num) ? (num < 1e11 ? num * 1000 : num) : dateValue
  const date = new Date(timestamp)

  if (isNaN(date.getTime())) return String(dateValue)

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export default function BagCard({ fellInfo }: { fellInfo: IGetFellInfo }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bagged Dates</Text>
      {fellInfo.bags && fellInfo.bags.length > 0 ? (
        fellInfo.bags.map((bag, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.bagCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/activities/[id]",
                params: { id: bag.activityId },
              })
            }>
            <Ionicons
              name='checkmark-circle'
              size={22}
              color={COLOURS.graph}
              style={styles.checkIcon}
            />
            <View style={styles.bagDetails}>
              <Text style={styles.listItemText}>{formatDate(bag.date)}</Text>

              {/* Activity Name with Sport Icon */}
              <View style={styles.activityRow}>
                <SportIcon
                  sport={bag.sport ?? "run"}
                  size={13}
                  color={COLOURS.textLight}
                />
                <Text style={styles.activityNameText}>{bag.activityName}</Text>
              </View>
            </View>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={COLOURS.textLight}
            />
          </Pressable>
        ))
      ) : (
        <Text style={styles.emptyText}>Not bagged yet</Text>
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
  bagCard: {
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
  checkIcon: {
    marginRight: 12,
  },
  bagDetails: {
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLOURS.text,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  activityNameText: {
    fontSize: 14,
    color: COLOURS.textLight,
  },
  emptyText: {
    fontSize: 15,
    color: COLOURS.textLight,
    fontStyle: "italic",
  },
})
