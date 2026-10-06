import { COLOURS } from "@/constants/colours"
import { UserContext } from "@/context/UserContext"
import { Ionicons } from "@expo/vector-icons"
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer"
import { useRouter } from "expo-router"
import React, { useContext } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export function CustomDrawer(props: DrawerContentComponentProps) {
  const { user } = useContext(UserContext)
  const router = useRouter()

  const navItems = [
    { label: "Home", icon: "home-outline", route: "/(app)/(tabs)" },
    { label: "Profile", icon: "person-outline", route: "/(app)/profile" },
    { label: "Settings", icon: "settings-outline", route: "/(app)/settings" },
  ]

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        </View>

        <View style={styles.divider} />

        {/* Navigation Items */}
        <View style={styles.menuContainer}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={COLOURS.pop || "#333"}
              />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Footer / Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/(auth)/login" as any)}>
          <Ionicons name='log-out-outline' size={20} color='#E53E3E' />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.background,
  },
  scrollContent: {
    paddingTop: 40,
  },
  profileContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLOURS.pop || "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOURS.text || "#000",
  },
  userEmail: {
    fontSize: 13,
    color: COLOURS.textLight || "#666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLOURS.border || "#E5E5E5",
    marginVertical: 10,
  },
  menuContainer: {
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLOURS.text || "#000",
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOURS.border || "#E5E5E5",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutText: {
    color: "#E53E3E",
    fontWeight: "600",
    fontSize: 15,
  },
})
