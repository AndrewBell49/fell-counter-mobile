import { COLOURS } from "@/constants/colours"
import { Ionicons } from "@expo/vector-icons"
import RNSlider from "@react-native-community/slider"
import React from "react"
import { Pressable, StyleSheet, View, ViewStyle } from "react-native"

export interface SliderProps {
  value: number
  minimumValue: number
  maximumValue: number
  step?: number
  onValueChange: (value: number) => void
  onSlidingComplete?: (value: number) => void
  minimumTrackTintColor?: string
  maximumTrackTintColor?: string
  thumbTintColor?: string
  disabled?: boolean
  showButtons?: boolean
  iconColor?: string
  disabledIconColor?: string
  style?: ViewStyle
  sliderStyle?: ViewStyle
}

export function Slider({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  onSlidingComplete,
  minimumTrackTintColor = COLOURS.primary,
  maximumTrackTintColor = COLOURS.border,
  thumbTintColor = COLOURS.primary,
  disabled = false,
  showButtons = true,
  iconColor = COLOURS.primary,
  disabledIconColor = COLOURS.border,
  style,
  sliderStyle,
}: SliderProps) {
  const isAtMin = value <= minimumValue
  const isAtMax = value >= maximumValue

  const handleDecrement = () => {
    if (disabled || isAtMin) return
    const nextValue = Math.max(minimumValue, Number((value - step).toFixed(10)))
    onValueChange(nextValue)
  }

  const handleIncrement = () => {
    if (disabled || isAtMax) return
    const nextValue = Math.min(maximumValue, Number((value + step).toFixed(10)))
    onValueChange(nextValue)
  }

  return (
    <View style={[styles.container, style]}>
      {showButtons && (
        <Pressable
          onPress={handleDecrement}
          disabled={disabled || isAtMin}
          hitSlop={8}
          style={({ pressed }) => [
            styles.button,
            pressed && !isAtMin && !disabled && styles.buttonPressed,
          ]}>
          <Ionicons
            name='remove-circle-outline'
            size={22}
            color={disabled || isAtMin ? disabledIconColor : iconColor}
          />
        </Pressable>
      )}

      <RNSlider
        style={[styles.slider, sliderStyle]}
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        disabled={disabled}
      />

      {showButtons && (
        <Pressable
          onPress={handleIncrement}
          disabled={disabled || isAtMax}
          hitSlop={8}
          style={({ pressed }) => [
            styles.button,
            pressed && !isAtMax && !disabled && styles.buttonPressed,
          ]}>
          <Ionicons
            name='add-circle-outline'
            size={22}
            color={disabled || isAtMax ? disabledIconColor : iconColor}
          />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  slider: {
    flex: 1,
    height: 36,
  },
  button: {
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.6,
  },
})
