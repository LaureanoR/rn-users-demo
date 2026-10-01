import { ActivityIndicator } from "react-native";

import { useTheme } from "../theme/use-theme";

export interface SpinnerProps {
  size?: "small" | "large";
  /** Texto que leen los lectores de pantalla. */
  label?: string;
}

export function Spinner({ size = "large", label = "Cargando" }: SpinnerProps) {
  const { colors } = useTheme();

  return (
    <ActivityIndicator
      size={size}
      color={colors.accent}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    />
  );
}
