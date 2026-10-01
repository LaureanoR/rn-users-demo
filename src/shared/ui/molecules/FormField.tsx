import { View } from "react-native";

import { Text } from "../atoms/Text";
import { TextInput, type TextInputProps } from "../atoms/TextInput";
import { useTheme } from "../theme/use-theme";

export type FormFieldProps = Omit<TextInputProps, "invalid"> & {
  label: string;
  error?: string;
};

/** Etiqueta + campo + mensaje de error, con el error anunciado a los lectores de pantalla. */
export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        invalid={error !== undefined}
        {...inputProps}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
