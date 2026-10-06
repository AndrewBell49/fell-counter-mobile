import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import React from "react"
import { StyleSheet, TextInput, View } from "react-native"
import { FilterState } from "./types"

interface DurationInputProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  error?: string
}

export const DurationInput = ({
  filters,
  setFilters,
  error,
}: DurationInputProps) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Duration</Text>
      <View style={[styles.durationBlock, error && styles.durationBlockError]}>
        <Text style={styles.subLabel}>Min Duration:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder='Hours'
            placeholderTextColor={COLOURS.textLight}
            keyboardType='numeric'
            value={filters.minHours}
            onChangeText={(v) => setFilters((f) => ({ ...f, minHours: v }))}
          />
          <Text style={styles.unitText}>h</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder='Mins'
            placeholderTextColor={COLOURS.textLight}
            keyboardType='numeric'
            value={filters.minMins}
            onChangeText={(v) => setFilters((f) => ({ ...f, minMins: v }))}
          />
          <Text style={styles.unitText}>m</Text>
        </View>

        <Text style={[styles.subLabel, { marginTop: 8 }]}>Max Duration:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder='Hours'
            placeholderTextColor={COLOURS.textLight}
            keyboardType='numeric'
            value={filters.maxHours}
            onChangeText={(v) => setFilters((f) => ({ ...f, maxHours: v }))}
          />
          <Text style={styles.unitText}>h</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder='Mins'
            placeholderTextColor={COLOURS.textLight}
            keyboardType='numeric'
            value={filters.maxMins}
            onChangeText={(v) => setFilters((f) => ({ ...f, maxMins: v }))}
          />
          <Text style={styles.unitText}>m</Text>
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  subLabel: {
    fontSize: 12,
    color: COLOURS.textLight,
    marginBottom: 4,
  },
  durationBlock: {
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  durationBlockError: {
    borderColor: COLOURS.pop,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLOURS.text,
    fontSize: 14,
  },
  inputError: {
    borderColor: COLOURS.pop,
  },
  unitText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLOURS.textLight,
  },
  errorText: {
    color: COLOURS.pop,
    fontSize: 12,
    marginTop: 6,
  },
})
