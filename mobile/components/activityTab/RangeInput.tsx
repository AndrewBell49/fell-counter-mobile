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
}

export const RangeInput = ({
  label,
  minVal,
  maxVal,
  onChangeMin,
  onChangeMax,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
}: RangeInputProps) => {
  return (
    <>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={minPlaceholder}
          placeholderTextColor={COLOURS.textLight}
          keyboardType='numeric'
          value={minVal}
          onChangeText={onChangeMin}
        />
        <Text style={styles.inputDash}>-</Text>
        <TextInput
          style={styles.input}
          placeholder={maxPlaceholder}
          placeholderTextColor={COLOURS.textLight}
          keyboardType='numeric'
          value={maxVal}
          onChangeText={onChangeMax}
        />
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
})
