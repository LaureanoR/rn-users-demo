import {
  Text as NativeText,
  type TextProps as NativeTextProps,
} from "react-native";

import type { Palette } from "../theme/colors";
import type { TextVariant } from "../theme/tokens";
import { useTheme } from "../theme/use-theme";

export type TextTone =
  "default" | "muted" | "danger" | "accent" | "onAccent" | "notice";

const toneToRole: Record<TextTone, keyof Palette> = {
  default: "text",
  muted: "textMuted",
  danger: "danger",
  accent: "accent",
  onAccent: "onAccent",
  notice: "noticeText",
};

export interface TextProps extends NativeTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({
  variant = "body",
  tone = "default",
  style,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();

  return (
    <NativeText
      accessibilityRole={variant === "title" ? "header" : undefined}
      style={[typography[variant], { color: colors[toneToRole[tone]] }, style]}
      {...rest}
    />
  );
}
