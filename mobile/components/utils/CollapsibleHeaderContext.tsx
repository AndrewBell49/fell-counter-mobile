import { COLOURS } from "@/constants/colours"
import { Ionicons } from "@expo/vector-icons"
import { DrawerActions } from "@react-navigation/native"
import { useNavigation, usePathname } from "expo-router"
import React, { createContext, useContext, useEffect } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const HEADER_BAR_HEIGHT = 56
const OFFLINE_BANNER_HEIGHT = 28

type CollapsibleHeaderContextType = {
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>
  headerHeightWithInsets: number
}

const CollapsibleHeaderContext =
  createContext<CollapsibleHeaderContextType | null>(null)

export const useCollapsibleHeader = () => {
  const context = useContext(CollapsibleHeaderContext)
  if (!context) {
    throw new Error(
      "useCollapsibleHeader must be used within CollapsibleHeaderProvider",
    )
  }
  return context
}

// Map route paths to header display titles
const TAB_TITLES: Record<string, string> = {
  "/": "Bags",
  "/index": "Bags",
  "/sports": "Sports",
  "/activities": "Activities",
  "/map": "Map",
}

export function CollapsibleHeaderProvider({
  children,
  isOffline = false,
}: {
  children: React.ReactNode
  isOffline?: boolean
}) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const pathname = usePathname()

  const bannerHeight = isOffline ? OFFLINE_BANNER_HEIGHT : 0
  const totalHeaderHeight = HEADER_BAR_HEIGHT + insets.top + bannerHeight

  const lastScrollY = useSharedValue(0)
  const headerTranslateY = useSharedValue(0)

  const isMapTab = pathname === "/map" || pathname.endsWith("/map")

  // Reset header position when switching tabs
  useEffect(() => {
    headerTranslateY.value = withTiming(0, { duration: 200 })
  }, [pathname])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y
      const diff = currentY - lastScrollY.value

      if (currentY <= 0) {
        headerTranslateY.value = 0
      } else {
        // Clamp translation between -totalHeaderHeight and 0
        const nextValue = headerTranslateY.value - diff
        headerTranslateY.value = Math.max(
          -totalHeaderHeight,
          Math.min(0, nextValue),
        )
      }

      lastScrollY.value = currentY
    },
  })

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
  }))

  const handleOpenDrawer = () => {
    // Triggers Expo Router / React Navigation drawer
    navigation.dispatch(DrawerActions.openDrawer())
  }

  const currentTitle = TAB_TITLES[pathname] || "App"

  return (
    <CollapsibleHeaderContext.Provider
      value={{ scrollHandler, headerHeightWithInsets: totalHeaderHeight }}>
      <View style={styles.flexContainer}>
        {children}

        {!isMapTab && (
          <Animated.View
            style={[
              styles.headerContainer,
              { height: totalHeaderHeight, paddingTop: insets.top },
              animatedHeaderStyle,
            ]}>
            <View style={styles.headerContent}>
              {/* Burger icon on left */}
              <TouchableOpacity
                onPress={handleOpenDrawer}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons
                  name='menu-outline'
                  size={26}
                  color={COLOURS.pop || "#333"}
                />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{currentTitle}</Text>

              {/* Spacer view to balance title centering */}
              <View style={styles.iconPlaceholder} />
            </View>

            {isOffline && (
              <View style={styles.offlineBanner}>
                <Ionicons
                  name='cloud-offline-outline'
                  size={14}
                  color={COLOURS.textLight || "#999"}
                />
                <Text style={styles.offlineText}>
                  Offline Mode — Showing saved data
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </View>
    </CollapsibleHeaderContext.Provider>
  )
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLOURS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOURS.border,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLOURS.pop,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  iconPlaceholder: {
    width: 36,
  },
  offlineBanner: {
    height: OFFLINE_BANNER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLOURS.border,
  },
  offlineText: {
    fontSize: 12,
    color: COLOURS.textLight,
    fontWeight: "500",
  },
})
