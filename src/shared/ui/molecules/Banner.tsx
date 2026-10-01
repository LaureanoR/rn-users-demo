import { StyleSheet, View } from "react-native";

import { Button } from "../atoms/Button";
import { Text } from "../atoms/Text";
import { useTheme } from "../theme/use-theme";

export interface BannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Banner({ message, actionLabel, onAction }: BannerProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: colors.noticeBackground,
          borderRadius: radii.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text tone="notice">{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "stretch" },
});
