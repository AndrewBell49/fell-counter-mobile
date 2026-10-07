import { COLOURS } from "@/constants/colours"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"

interface SearchBarInputProps {
  value: string
  onChangeText: (text: string) => void
  onClear?: () => void
  placeholder?: string
}

export const SearchBarInput: React.FC<SearchBarInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search title or keywords...",
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name='search-outline'
        size={18}
        color={COLOURS.textLight}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOURS.textLight}
        returnKeyType='search'
        autoCapitalize='none'
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear || (() => onChangeText(""))}
          style={styles.clearBtn}>
          <Ionicons name='close-circle' size={18} color={COLOURS.textLight} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLOURS.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
})
