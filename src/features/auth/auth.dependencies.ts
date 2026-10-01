import type { AuthRepository } from "./auth.repository";
import type { SessionStorage } from "./session.storage";

/** Todo lo que el feature necesita del exterior; lo provee la composition root. */
export interface AuthDependencies {
  authRepository: AuthRepository;
  sessionStorage: SessionStorage;
  /** Se invoca al cerrar sesión; la composición lo usa para vaciar cachés de otros features. */
  onSignedOut?: () => void;
}
