import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"

interface SearchFilterBarProps {
  onPress: () => void
  activeFilterCount: number
  hasActiveSearch: boolean
  searchTerm?: string
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  onPress,
  activeFilterCount,
  hasActiveSearch,
  searchTerm,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}>
      <Ionicons name='search-outline' size={20} color={COLOURS.primary} />
      <View style={styles.textContainer}>
        <Text style={styles.placeholderText} numberOfLines={1}>
          {hasActiveSearch && searchTerm
            ? `"${searchTerm}"`
            : "Search, Filter & Sort"}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
        <Ionicons name='options-outline' size={18} color={COLOURS.primary} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: COLOURS.textLight,
    fontWeight: "500",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    backgroundColor: COLOURS.pop,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLOURS.background,
    fontSize: 11,
    fontWeight: "bold",
  },
})
