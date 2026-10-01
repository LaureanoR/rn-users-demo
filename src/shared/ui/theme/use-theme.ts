import { useColorScheme } from "react-native";

import { darkPalette, lightPalette, type Palette } from "./colors";
import { radii, spacing, typography } from "./tokens";

export interface Theme {
  scheme: "light" | "dark";
  colors: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

// Constantes de módulo: la identidad del tema solo cambia cuando cambia el esquema.
const themes: Record<Theme["scheme"], Theme> = {
  light: { scheme: "light", colors: lightPalette, spacing, radii, typography },
  dark: { scheme: "dark", colors: darkPalette, spacing, radii, typography },
};

export function useTheme(): Theme {
  return themes[useColorScheme() === "dark" ? "dark" : "light"];
}
