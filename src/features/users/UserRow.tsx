import { StyleSheet, View } from "react-native";

import { Avatar, Text, useTheme } from "@/shared/ui";

import type { User } from "./user.model";

interface UserRowProps {
  user: User;
}

// Presentacional y sin estado: es seguro dentro de una lista que recicla celdas.
export function UserRow({ user }: UserRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${user.fullName}, ${user.email}`}
      style={[
        styles.row,
        {
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: spacing.md,
        },
      ]}
    >
      <Avatar uri={user.avatarUrl} recyclingKey={user.id} />
      <View style={styles.texts}>
        <Text variant="label" numberOfLines={1}>
          {user.fullName}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {user.email}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  texts: { flex: 1 },
});
