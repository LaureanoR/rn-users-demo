import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { useTheme } from "../theme/use-theme";

export interface AvatarProps {
  uri: string;
  size?: number;
  /** En listas con reciclaje evita mostrar la imagen anterior mientras carga la nueva. */
  recyclingKey?: string;
  /** Si se omite, el avatar es decorativo y se oculta a los lectores de pantalla. */
  accessibilityLabel?: string;
}

// Sin estado local: es seguro dentro de una lista que recicla celdas.
export function Avatar({
  uri,
  size = 48,
  recyclingKey,
  accessibilityLabel,
}: AvatarProps) {
  const { colors } = useTheme();
  const decorative = accessibilityLabel === undefined;

  return (
    <View
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : "auto"}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri }}
        recyclingKey={recyclingKey}
        contentFit="cover"
        transition={150}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: "100%" },
});
