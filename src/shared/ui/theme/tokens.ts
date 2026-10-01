import type { TextStyle } from "react-native";

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const radii = { sm: 8, md: 12, full: 9999 } as const;

export type TextVariant = "title" | "body" | "label" | "caption";

export const typography = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" },
  label: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
} as const satisfies Record<TextVariant, TextStyle>;
