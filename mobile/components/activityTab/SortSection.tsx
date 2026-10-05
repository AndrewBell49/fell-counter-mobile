import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { SortField, SortOrder } from "./types"

interface SortSectionProps {
  sortBy: SortField
  setSortBy: (field: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
}

const SORT_OPTIONS: { label: string; key: SortField }[] = [
  { label: "Date", key: "startDate" },
  { label: "Distance", key: "distance" },
  { label: "Time", key: "movingTime" },
  { label: "Elevation", key: "elevationGain" },
  { label: "Sport", key: "sport" },
  { label: "Fells", key: "fellsCount" },
]

export const SortSection = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: SortSectionProps) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Sort By</Text>
      <View style={styles.chipRow}>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.chip, sortBy === opt.key && styles.chipActive]}
            onPress={() => setSortBy(opt.key)}>
            <Text
              style={[
                styles.chipText,
                sortBy === opt.key && styles.chipTextActive,
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.orderRow}>
        <Pressable
          style={[
            styles.orderBtn,
            sortOrder === "DESC" && styles.orderBtnActive,
          ]}
          onPress={() => setSortOrder("DESC")}>
          <Text
            style={[
              styles.orderBtnText,
              sortOrder === "DESC" && styles.orderBtnTextActive,
            ]}>
            Descending (High to Low)
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.orderBtn,
            sortOrder === "ASC" && styles.orderBtnActive,
          ]}
          onPress={() => setSortOrder("ASC")}>
          <Text
            style={[
              styles.orderBtnText,
              sortOrder === "ASC" && styles.orderBtnTextActive,
            ]}>
            Ascending (Low to High)
          </Text>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLOURS.text,
    marginTop: 14,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: COLOURS.primary,
    borderColor: COLOURS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLOURS.text,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  orderRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  orderBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLOURS.border,
    borderRadius: 8,
    alignItems: "center",
  },
  orderBtnActive: {
    borderColor: COLOURS.primary,
    backgroundColor: COLOURS.card,
  },
  orderBtnText: {
    fontSize: 12,
    color: COLOURS.textLight,
  },
  orderBtnTextActive: {
    color: COLOURS.primary,
    fontWeight: "bold",
  },
})
