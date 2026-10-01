import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Screen, Text, useTheme } from "@/shared/ui";

import { LoginForm } from "./LoginForm";

export function LoginScreen() {
  const { spacing } = useTheme();

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { padding: spacing.xl, gap: spacing.xl },
          ]}
        >
          <View style={{ gap: spacing.xs }}>
            <Text variant="title">Iniciar sesión</Text>
            <Text tone="muted">
              Ingresá con el usuario demo para ver la lista de usuarios.
            </Text>
          </View>
          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center" },
});
