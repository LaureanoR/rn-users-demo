import { DarkTheme, DefaultTheme, type Theme } from "expo-router";

import { useTheme } from "@/shared/ui";

/** Tema de navegación derivado de nuestros tokens, para que el header siga el modo oscuro. */
export function useNavigationTheme(): Theme {
  const { scheme, colors } = useTheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };
}
