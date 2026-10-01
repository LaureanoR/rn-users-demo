/** Los colores se nombran por rol, no por valor: cambiar la marca es tocar este archivo. */
export interface Palette {
  background: string;
  surface: string;
  /** Separadores decorativos; no sirve para delimitar controles. */
  border: string;
  /** Borde de campos de entrada: contrasta al menos 3:1 para identificar el control. */
  controlBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  danger: string;
  noticeBackground: string;
  noticeText: string;
}

export const lightPalette: Palette = {
  background: "#FFFFFF",
  surface: "#F2F4F7",
  border: "#E3E6EB",
  controlBorder: "#6E7685",
  text: "#14171C",
  textMuted: "#565D6B",
  accent: "#1F4FCC",
  onAccent: "#FFFFFF",
  danger: "#B3261E",
  noticeBackground: "#FFF1CC",
  noticeText: "#5A4100",
};

export const darkPalette: Palette = {
  background: "#0E1013",
  surface: "#191C21",
  border: "#2A2E36",
  controlBorder: "#7C8594",
  text: "#F1F3F6",
  textMuted: "#A3AAB6",
  accent: "#8CAEFF",
  onAccent: "#0A1230",
  danger: "#FF8F87",
  noticeBackground: "#3A2E0A",
  noticeText: "#FFE3A0",
};
