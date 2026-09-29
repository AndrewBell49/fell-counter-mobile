import { COLOURS } from "@/constants/colours"
import React from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

interface LocationButtonProps {
  onPress: () => void
  disabled?: boolean
}

export function LocationButton({
  onPress,
  disabled = false,
}: LocationButtonProps) {
  return (
    <TouchableOpacity
      style={styles.locationButton}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <Svg width={22} height={22} viewBox='0 0 24 24' fill='none'>
        <Circle cx={12} cy={12} r={3} fill='#0F172A' />
        <Circle
          cx={12}
          cy={12}
          r={7}
          stroke='#0F172A'
          strokeWidth={2}
          fill='none'
        />
        <Path
          d='M12 2v3M12 19v3M2 12h3M19 12h3'
          stroke='#0F172A'
          strokeWidth={2}
          strokeLinecap='round'
        />
      </Svg>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  locationButton: {
    position: "absolute",
    bottom: 24,
    right: 16,
    backgroundColor: COLOURS.background,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
})
