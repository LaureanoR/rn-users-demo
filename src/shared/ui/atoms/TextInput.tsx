import { useState, type ComponentPropsWithRef } from "react";
import { StyleSheet, TextInput as NativeTextInput } from "react-native";

import { useTheme } from "../theme/use-theme";

export type TextInputProps = ComponentPropsWithRef<typeof NativeTextInput> & {
  invalid?: boolean;
};

/** Tipo del `ref` de un campo, para enfocarlo desde el exterior sin importar el componente nativo. */
export type TextInputHandle = NativeTextInput;

const MIN_HEIGHT = 48;

export function TextInput({
  invalid = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = invalid
    ? colors.danger
    : focused
      ? colors.accent
      : colors.controlBorder;

  return (
    <NativeTextInput
      placeholderTextColor={colors.textMuted}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        styles.base,
        {
          fontSize: typography.body.fontSize,
          color: colors.text,
          backgroundColor: colors.background,
          borderColor,
          borderRadius: radii.md,
          // El borde engrosado al enfocar compensa el padding para que el campo no se mueva.
          borderWidth: focused ? 2 : 1,
          paddingHorizontal: focused ? spacing.md - 1 : spacing.md,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { minHeight: MIN_HEIGHT },
});
