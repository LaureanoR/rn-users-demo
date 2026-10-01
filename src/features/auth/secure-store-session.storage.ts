import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import type { Session } from "./auth.model";
import type { SessionStorage } from "./session.storage";

const SESSION_KEY = "rn-users-demo.session";
const INSTALL_MARKER_KEY = "rn-users-demo.install-marker";

// El token solo se usa con la app abierta (equipo desbloqueado) y no debe migrar por backup.
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class SecureStoreSessionStorage implements SessionStorage {
  async read(): Promise<Session | null> {
    try {
      // El Keychain de iOS sobrevive a la desinstalación y AsyncStorage no: sin esta marca,
      // una reinstalación heredaría la sesión anterior.
      if ((await AsyncStorage.getItem(INSTALL_MARKER_KEY)) === null) {
        await SecureStore.deleteItemAsync(SESSION_KEY, OPTIONS);
        await AsyncStorage.setItem(INSTALL_MARKER_KEY, "1");
        return null;
      }

      const raw = await SecureStore.getItemAsync(SESSION_KEY, OPTIONS);
      if (raw === null) {
        return null;
      }

      const session = parseSession(raw);
      if (session === null) {
        await SecureStore.deleteItemAsync(SESSION_KEY, OPTIONS);
      }
      return session;
    } catch {
      await discardSession();
      return null;
    }
  }

  async write(session: Session): Promise<void> {
    await AsyncStorage.setItem(INSTALL_MARKER_KEY, "1");
    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify(session),
      OPTIONS,
    );
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY, OPTIONS);
  }
}

async function discardSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY, OPTIONS);
  } catch {
    // Si tampoco se puede borrar, no hay nada más que hacer: se arranca sin sesión.
  }
}

// Sin librería de esquemas, la frontera con el almacenamiento se valida a mano.
function parseSession(raw: string): Session | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isSession(value) ? value : null;
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { token, user } = value as Record<string, unknown>;
  if (typeof token !== "string" || typeof user !== "object" || user === null) {
    return false;
  }
  const { id, name, email } = user as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof name === "string" &&
    typeof email === "string"
  );
}
