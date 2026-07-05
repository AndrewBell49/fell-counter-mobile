import { COLOURS } from "@/constants/colours"
import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"

interface LoadingProps {
  message?: string
  size?: number
}

export function Loading({ message = "Loading...", size = 48 }: LoadingProps) {
  const spinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    animation.start()

    return () => animation.stop()
  }, [spinValue])

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: size / 10,
            transform: [{ rotate }],
          },
        ]}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spinner: {
    borderColor: COLOURS.border,
    borderTopColor: COLOURS.primary,
  },
  text: {
    fontSize: 16,
    color: COLOURS.text,
  },
})
