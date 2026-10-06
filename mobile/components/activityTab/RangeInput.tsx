import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import React from "react"
import { StyleSheet, TextInput, View } from "react-native"

interface RangeInputProps {
  label: string
  minVal: string
  maxVal: string
  onChangeMin: (val: string) => void
  onChangeMax: (val: string) => void
  minPlaceholder?: string
  maxPlaceholder?: string
  error?: string
}

export const RangeInput = ({
  label,
  minVal,
  maxVal,
  onChangeMin,
  onChangeMax,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  error,
}: RangeInputProps) => {
  return (
    <>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={minPlaceholder}
          placeholderTextColor={COLOURS.textLight}
          keyboardType='numeric'
          value={minVal}
          onChangeText={onChangeMin}
        />
        <Text style={styles.inputDash}>-</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={maxPlaceholder}
          placeholderTextColor={COLOURS.textLight}
          keyboardType='numeric'
          value={maxVal}
          onChangeText={onChangeMax}
        />
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
  inputDash: {
    fontSize: 16,
    color: COLOURS.textLight,
  },
  inputError: {
    borderColor: COLOURS.pop,
  },
  errorText: {
    color: COLOURS.pop,
    fontSize: 12,
    marginTop: 6,
  },
})
