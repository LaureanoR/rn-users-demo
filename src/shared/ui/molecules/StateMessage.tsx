import { StyleSheet, View } from "react-native";

import { Button } from "../atoms/Button";
import { Text } from "../atoms/Text";
import { useTheme } from "../theme/use-theme";

export interface StateMessageProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Mensaje centrado para estados como error o lista vacía, con una acción opcional. */
export function StateMessage({
  title,
  description,
  actionLabel,
  onAction,
}: StateMessageProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl, gap: spacing.md }]}>
      <Text variant="title" style={styles.centered}>
        {title}
      </Text>
      {description ? (
        <Text tone="muted" style={styles.centered}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  centered: { textAlign: "center" },
});
