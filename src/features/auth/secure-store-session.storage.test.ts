import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { SecureStoreSessionStorage } from "./secure-store-session.storage";
import { SESSION } from "./testing/fakes";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

// El Keychain/Keystore se simula con un Map: lo que importa es el comportamiento del adaptador.
jest.mock("expo-secure-store", () => {
  const items = new Map<string, string>();
  return {
    __items: items,
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY",
    getItemAsync: jest.fn(async (key: string) => items.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      items.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      items.delete(key);
    }),
  };
});

const keychain = (SecureStore as unknown as { __items: Map<string, string> })
  .__items;
const SESSION_KEY = "rn-users-demo.session";
const INSTALL_MARKER_KEY = "rn-users-demo.install-marker";

beforeEach(async () => {
  keychain.clear();
  await AsyncStorage.clear();
});

describe("SecureStoreSessionStorage", () => {
  it("devuelve la sesión que se escribió", async () => {
    const storage = new SecureStoreSessionStorage();

    await storage.write(SESSION);

    expect(await storage.read()).toEqual(SESSION);
  });

  it("guarda con accesibilidad solo-desbloqueado y sin migrar por backup", async () => {
    await new SecureStoreSessionStorage().write(SESSION);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_KEY,
      JSON.stringify(SESSION),
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it("clear elimina la sesión", async () => {
    const storage = new SecureStoreSessionStorage();
    await storage.write(SESSION);

    await storage.clear();

    expect(await storage.read()).toBeNull();
  });

  it("sin nada guardado devuelve null", async () => {
    expect(await new SecureStoreSessionStorage().read()).toBeNull();
  });

  describe("reinstalación (el Keychain de iOS sobrevive, AsyncStorage no)", () => {
    it("descarta una sesión heredada si falta la marca de instalación", async () => {
      keychain.set(SESSION_KEY, JSON.stringify(SESSION));

      expect(await new SecureStoreSessionStorage().read()).toBeNull();
      expect(keychain.has(SESSION_KEY)).toBe(false);
      expect(await AsyncStorage.getItem(INSTALL_MARKER_KEY)).toBe("1");
    });

    it("tras la reinstalación, una sesión nueva sí se restaura", async () => {
      keychain.set(SESSION_KEY, JSON.stringify(SESSION));
      const storage = new SecureStoreSessionStorage();
      await storage.read();

      await storage.write(SESSION);

      expect(await storage.read()).toEqual(SESSION);
    });
  });

  describe("datos corruptos o inesperados", () => {
    beforeEach(() => AsyncStorage.setItem(INSTALL_MARKER_KEY, "1"));

    it.each([
      ["JSON inválido", "{no es json"],
      ["un valor que no es objeto", JSON.stringify("hola")],
      ["null", "null"],
      ["una sesión sin token", JSON.stringify({ user: SESSION.user })],
      [
        "una sesión con el usuario incompleto",
        JSON.stringify({ token: "t", user: { id: "1" } }),
      ],
      ["un token que no es string", JSON.stringify({ ...SESSION, token: 123 })],
    ])("%s: devuelve null y borra el dato", async (_name, raw) => {
      keychain.set(SESSION_KEY, raw);

      expect(await new SecureStoreSessionStorage().read()).toBeNull();
      expect(keychain.has(SESSION_KEY)).toBe(false);
    });
  });

  describe("read nunca rechaza (contrato del puerto)", () => {
    beforeEach(() => AsyncStorage.setItem(INSTALL_MARKER_KEY, "1"));

    it("si el Keychain falla al leer, devuelve null", async () => {
      jest
        .mocked(SecureStore.getItemAsync)
        .mockRejectedValueOnce(new Error("keystore"));

      expect(await new SecureStoreSessionStorage().read()).toBeNull();
    });

    it("si además falla el borrado, igual devuelve null", async () => {
      jest
        .mocked(SecureStore.getItemAsync)
        .mockRejectedValueOnce(new Error("keystore"));
      jest
        .mocked(SecureStore.deleteItemAsync)
        .mockRejectedValueOnce(new Error("keystore"));

      expect(await new SecureStoreSessionStorage().read()).toBeNull();
    });
  });

  describe("write y clear sí rechazan si no pueden completarse", () => {
    it("write", async () => {
      jest
        .mocked(SecureStore.setItemAsync)
        .mockRejectedValueOnce(new Error("keystore"));

      await expect(
        new SecureStoreSessionStorage().write(SESSION),
      ).rejects.toThrow("keystore");
    });

    it("clear", async () => {
      jest
        .mocked(SecureStore.deleteItemAsync)
        .mockRejectedValueOnce(new Error("keystore"));

      await expect(new SecureStoreSessionStorage().clear()).rejects.toThrow(
        "keystore",
      );
    });
  });
});
