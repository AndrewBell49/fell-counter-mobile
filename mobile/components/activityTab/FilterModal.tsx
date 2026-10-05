import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native"

import { DurationInput } from "./DurationInput"
import { RangeInput } from "./RangeInput"
import { SortSection } from "./SortSection"
import { FilterState, SortField, SortOrder } from "./types"

interface FilterModalProps {
  visible: boolean
  onClose: () => void
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  sortBy: SortField
  setSortBy: (field: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  sportOptions?: string[]
  onApply: () => void
  onReset: () => void
}

export const FilterModal = ({
  visible,
  onClose,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  sportOptions = ["All"],
  onApply,
  onReset,
}: FilterModalProps) => {
  const handleSportToggle = (sport: string) => {
    setFilters((f) => {
      const isAll = sport.toLowerCase() === "all"
      if (isAll) return { ...f, sports: ["All"] }

      // Remove "All" if picking a specific sport
      const currentSports = f.sports.filter((s) => s.toLowerCase() !== "all")
      const exists = currentSports.some(
        (s) => s.toLowerCase() === sport.toLowerCase(),
      )

      let updated = exists
        ? currentSports.filter((s) => s.toLowerCase() !== sport.toLowerCase())
        : [...currentSports, sport]

      if (updated.length === 0) {
        updated = ["All"]
      }

      return { ...f, sports: updated }
    })
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <Pressable onPress={onClose}>
              <Ionicons name='close' size={24} color={COLOURS.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* SORT SECTION */}
            <SortSection
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />

            {/* MULTI-SELECT SPORT FILTER */}
            <Text style={styles.sectionTitle}>Sport</Text>
            <View style={styles.chipRow}>
              {sportOptions.map((sport) => {
                const isSelected = filters.sports.some(
                  (s) => s.toLowerCase() === sport.toLowerCase(),
                )

                return (
                  <Pressable
                    key={sport}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => handleSportToggle(sport)}>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}>
                      {sport}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* FELLS BAGGED */}
            <RangeInput
              label='Fells Bagged'
              minVal={filters.minFells}
              maxVal={filters.maxFells}
              minPlaceholder='Min Fells'
              maxPlaceholder='Max Fells'
              onChangeMin={(v) => setFilters((f) => ({ ...f, minFells: v }))}
              onChangeMax={(v) => setFilters((f) => ({ ...f, maxFells: v }))}
            />

            {/* DURATION */}
            <DurationInput filters={filters} setFilters={setFilters} />

            {/* DISTANCE RANGE */}
            <RangeInput
              label='Distance (km)'
              minVal={filters.minDistance}
              maxVal={filters.maxDistance}
              onChangeMin={(v) => setFilters((f) => ({ ...f, minDistance: v }))}
              onChangeMax={(v) => setFilters((f) => ({ ...f, maxDistance: v }))}
            />

            {/* ELEVATION RANGE */}
            <RangeInput
              label='Elevation Gain (m)'
              minVal={filters.minElevation}
              maxVal={filters.maxElevation}
              onChangeMin={(v) =>
                setFilters((f) => ({ ...f, minElevation: v }))
              }
              onChangeMax={(v) =>
                setFilters((f) => ({ ...f, maxElevation: v }))
              }
            />
          </ScrollView>

          {/* MODAL FOOTER */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.resetBtn} onPress={onReset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={onApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLOURS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    marginBottom: 16,
  },
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
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOURS.border,
    alignItems: "center",
  },
  resetBtnText: {
    fontWeight: "600",
    color: COLOURS.text,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: COLOURS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyBtnText: {
    fontWeight: "bold",
    color: "#fff",
  },
})
