import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function HeaderBar({ text }: { text: string }) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={12}>
        <Ionicons name='arrow-back' size={26} color={COLOURS.text} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: COLOURS.cardSecondary,

    borderBottomWidth: 1,
    borderBottomColor: COLOURS.border,

    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
    zIndex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOURS.text,
    flex: 1,
  },
})
