const lightTheme = {
  primary: "#1C241B",
  background: "#F5F7F5",
  text: "#121812",
  border: "#D3DBD3",
  textLight: "#687568",
  pop: "#D32F2F",
  graph: "#D97706",
  card: "#A6CDB5",
  cardSecondary: "#B9D1DC",
  shadow: "#000000",
  transparent: "#00000000",
}

const darkTheme = {
  primary: "#E0E0E0",
  background: "#0A0A0A",
  text: "#F5F5F5",
  border: "#2C2C2C",
  textLight: "#9E9E9E",
  pop: "#FF5252",
  graph: "#FFB430",
  card: "#4A5D23",
  cardSecondary: "#38454F",
  shadow: "#000000",
  transparent: "#00000000",
}

export const THEMES = {
  default: { light: lightTheme, dark: darkTheme },
}

export const THEME: "light" | "dark" = "dark"
export const COLOURS = THEMES.default[THEME]
