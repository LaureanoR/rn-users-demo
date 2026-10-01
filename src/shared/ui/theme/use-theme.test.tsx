import { renderHook } from "@testing-library/react-native";
import { useColorScheme } from "react-native";

import { darkPalette, lightPalette } from "./colors";
import { useTheme } from "./use-theme";

// En Jest el módulo nativo de Appearance está simulado: se controla directamente el hook.
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockedScheme = jest.mocked(useColorScheme);

describe("useTheme", () => {
  it("usa la paleta clara con el esquema claro", async () => {
    mockedScheme.mockReturnValue("light");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.scheme).toBe("light");
    expect(result.current.colors).toBe(lightPalette);
  });

  it("usa la paleta oscura con el esquema oscuro", async () => {
    mockedScheme.mockReturnValue("dark");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.scheme).toBe("dark");
    expect(result.current.colors).toBe(darkPalette);
  });

  it("con el esquema sin especificar cae en el claro", async () => {
    mockedScheme.mockReturnValue("unspecified");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.scheme).toBe("light");
  });

  it("devuelve el mismo objeto mientras no cambie el esquema (identidad estable)", async () => {
    mockedScheme.mockReturnValue("dark");

    const { result, rerender } = await renderHook(() => useTheme());
    const first = result.current;
    await rerender(undefined);

    expect(result.current).toBe(first);
  });
});
