import { COLOURS } from "@/constants/colours"
import {
  Text as RNText,
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
} from "react-native"

const FONT_MAP = {
  regular: "Roboto_400Regular",
  bold: "Roboto_700Bold",
  italic: "Roboto_400Regular_Italic",
  boldItalic: "Roboto_700Bold_Italic",
}

function resolveFontFamily(style: StyleProp<TextStyle>) {
  const flat = StyleSheet.flatten(style) || {}
  const isBold = flat.fontWeight === "bold" || flat.fontWeight === "700"
  const isItalic = flat.fontStyle === "italic"

  if (isBold && isItalic) return FONT_MAP.boldItalic
  if (isBold) return FONT_MAP.bold
  if (isItalic) return FONT_MAP.italic
  return FONT_MAP.regular
}

export function Text({ style, ...props }: TextProps) {
  const fontFamily = resolveFontFamily(style)

  return <RNText style={[styles.default, style, { fontFamily }]} {...props} />
}

const styles = StyleSheet.create({
  default: {
    color: COLOURS.text,
    fontSize: 16,
  },
})
