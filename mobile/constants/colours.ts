// ---------- DEFAULT ----------
const defaultThemeLight = {
  primary: "#333333",
  background: "#FAFAFA",
  text: "#1A1A1A",
  border: "#E0E0E0",
  white: "#FFFFFF",
  textLight: "#757575",
  pop: "#E53935",
  graph: "#43A047",
  card: "#FFFFFF",
  shadow: "#000000",
}

const defaultThemeDark = {
  primary: "#E0E0E0",
  background: "#000000",
  text: "#F5F5F5",
  border: "#2C2C2C",
  white: "#FFFFFF",
  textLight: "#9E9E9E",
  pop: "#FF5252",
  graph: "#69F0AE",
  card: "#121212",
  shadow: "#000000",
}

// ---------- COFFEE ----------
const coffeeThemeLight = {
  primary: "#8B593E",
  background: "#FFF8F3",
  text: "#4A3428",
  border: "#E5D3B7",
  white: "#FFFFFF",
  textLight: "#9A8478",
  pop: "#E74C3C",
  graph: "#2ECC71",
  card: "#FFFFFF",
  shadow: "#000000",
}

const coffeeThemeDark = {
  primary: "#C68B59",
  background: "#1F1611",
  text: "#F0E0D0",
  border: "#4A3428",
  white: "#FFFFFF",
  textLight: "#A8886F",
  pop: "#FF6B6B",
  graph: "#4ADE80",
  card: "#2A1F19",
  shadow: "#000000",
}

// ---------- FOREST ----------
const forestThemeLight = {
  primary: "#2E7D32",
  background: "#E8F5E9",
  text: "#1B5E20",
  border: "#C8E6C9",
  white: "#FFFFFF",
  textLight: "#66BB6A",
  pop: "#C62828",
  graph: "#388E3C",
  card: "#FFFFFF",
  shadow: "#000000",
}

const forestThemeDark = {
  primary: "#66BB6A",
  background: "#0F1F11",
  text: "#E0F2E1",
  border: "#2E4A31",
  white: "#FFFFFF",
  textLight: "#7FBF83",
  pop: "#FF6659",
  graph: "#69F0AE",
  card: "#1A2E1D",
  shadow: "#000000",
}

// ---------- PURPLE ----------
const purpleThemeLight = {
  primary: "#6A1B9A",
  background: "#F3E5F5",
  text: "#4A148C",
  border: "#D1C4E9",
  white: "#FFFFFF",
  textLight: "#BA68C8",
  pop: "#D32F2F",
  graph: "#388E3C",
  card: "#FFFFFF",
  shadow: "#000000",
}

const purpleThemeDark = {
  primary: "#AB47BC",
  background: "#1A0F24",
  text: "#EDE0F5",
  border: "#4A2E6B",
  white: "#FFFFFF",
  textLight: "#C79FE0",
  pop: "#FF6659",
  graph: "#66BB6A",
  card: "#2A1B3D",
  shadow: "#000000",
}

// ---------- OCEAN ----------
const oceanThemeLight = {
  primary: "#0277BD",
  background: "#E1F5FE",
  text: "#01579B",
  border: "#B3E5FC",
  white: "#FFFFFF",
  textLight: "#4FC3F7",
  pop: "#EF5350",
  graph: "#26A69A",
  card: "#FFFFFF",
  shadow: "#000000",
}

const oceanThemeDark = {
  primary: "#4FC3F7",
  background: "#071824",
  text: "#DCF3FF",
  border: "#1E4258",
  white: "#FFFFFF",
  textLight: "#6FC6F0",
  pop: "#FF6E6A",
  graph: "#4DD0C4",
  card: "#0F2836",
  shadow: "#000000",
}

export const THEMES = {
  default: { light: defaultThemeLight, dark: defaultThemeDark },
  coffee: { light: coffeeThemeLight, dark: coffeeThemeDark },
  forest: { light: forestThemeLight, dark: forestThemeDark },
  purple: { light: purpleThemeLight, dark: purpleThemeDark },
  ocean: { light: oceanThemeLight, dark: oceanThemeDark },
}

export const COLOURS = THEMES.default.light
