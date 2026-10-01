import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import {
  Button,
  FormField,
  Text,
  useTheme,
  type TextInputHandle,
} from "@/shared/ui";

import type { Credentials } from "./auth.model";
import { isInvalidCredentialsError } from "./auth.repository";
import { useSessionActions } from "./session.context";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 8;

export function LoginForm() {
  const { spacing } = useTheme();
  const { signIn } = useSessionActions();
  const passwordInput = useRef<TextInputHandle>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ defaultValues: { email: "", password: "" } });

  const submit = handleSubmit(async (credentials) => {
    try {
      await signIn(credentials);
    } catch (error) {
      setError("root", {
        message: isInvalidCredentialsError(error)
          ? "El email o la contraseña no son correctos."
          : "No se pudo iniciar sesión. Intentá de nuevo.",
      });
    }
  });

  return (
    <View style={{ gap: spacing.lg }}>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Ingresá tu email.",
          pattern: {
            value: EMAIL_PATTERN,
            message: "Ingresá un email válido.",
          },
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label="Email"
            value={value}
            onChangeText={(text) => onChange(text.trim())}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordInput.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{
          required: "Ingresá tu contraseña.",
          minLength: {
            value: MIN_PASSWORD_LENGTH,
            message: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
          },
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            ref={passwordInput}
            label="Contraseña"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect={false}
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
      {errors.root?.message ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {errors.root.message}
        </Text>
      ) : null}
      <Button
        label="Ingresar"
        onPress={() => void submit()}
        loading={isSubmitting}
      />
    </View>
  );
}
