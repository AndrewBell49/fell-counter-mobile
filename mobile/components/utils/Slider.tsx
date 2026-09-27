import { COLOURS } from "@/constants/colours"
import React, { useEffect, useRef, useState } from "react"
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { Text } from "./Text"

export interface SliderOption<T> {
  label: string
  value: T
}

interface Props<T> {
  options: SliderOption<T>[]
  value: T
  onChange: (value: T) => void
  style?: ViewStyle
}

const PADDING = 3

export function Slider<T>({ options, value, onChange, style }: Props<T>) {
  const [containerWidth, setContainerWidth] = useState(0)
  const activeIndex = options.findIndex((opt) => opt.value === value)

  const animValue = useRef(
    new Animated.Value(activeIndex < 0 ? 0 : activeIndex),
  ).current

  useEffect(() => {
    if (activeIndex >= 0) {
      Animated.spring(animValue, {
        toValue: activeIndex,
        bounciness: 6,
        speed: 12,
        useNativeDriver: true,
      }).start()
    }
  }, [activeIndex, animValue])

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }

  const availableWidth = Math.max(0, containerWidth - PADDING * 2)
  const segmentWidth = options.length > 0 ? availableWidth / options.length : 0

  const translateX = animValue.interpolate({
    inputRange: [0, Math.max(1, options.length - 1)],
    outputRange: [0, segmentWidth * (options.length - 1)],
  })

  const handlePress = (pressedValue: T) => {
    if (pressedValue === value && options.length === 2) {
      const otherOption = options.find((opt) => opt.value !== value)
      if (otherOption) {
        onChange(otherOption.value)
        return
      }
    }
    onChange(pressedValue)
  }

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {containerWidth > 0 && segmentWidth > 0 && (
        <Animated.View
          pointerEvents='none'
          style={[
            styles.activeIndicator,
            {
              width: segmentWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {options.map((option, index) => {
        const isActive = index === activeIndex
        return (
          <Pressable
            key={String(option.value)}
            style={[
              styles.segment,
              segmentWidth > 0 && { width: segmentWidth },
            ]}
            onPress={() => handlePress(option.value)}>
            <Text
              numberOfLines={1}
              style={[
                styles.text,
                isActive ? styles.activeText : styles.inactiveText,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLOURS.border,
    borderRadius: 20,
    padding: PADDING,
    marginTop: 16,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: 340,
  },
  activeIndicator: {
    position: "absolute",
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    backgroundColor: COLOURS.graph,
    borderRadius: 17,
    zIndex: 0,
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  activeText: {
    color: COLOURS.card,
  },
  inactiveText: {
    color: COLOURS.text,
    opacity: 0.85,
  },
})
