import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useTheme } from "../theme/use-theme";

export interface ScreenProps {
  children: ReactNode;
  /** Por defecto asume un header de navegación arriba; para pantallas sin header, incluir "top". */
  edges?: readonly Edge[];
}

const DEFAULT_EDGES: readonly Edge[] = ["left", "right", "bottom"];

/** Plantilla de pantalla: fondo del tema y área segura. */
export function Screen({ children, edges = DEFAULT_EDGES }: ScreenProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
