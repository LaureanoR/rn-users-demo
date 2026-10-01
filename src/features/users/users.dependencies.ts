import { createContext, useContext } from "react";

import type { UsersRepository } from "./users.repository";

/** Todo lo que el feature necesita del exterior; lo provee la composition root. */
export interface UsersDependencies {
  usersRepository: UsersRepository;
}

const UsersDependenciesContext = createContext<UsersDependencies | null>(null);

// React 19: el contexto se renderiza directamente como Provider.
export const UsersDependenciesProvider = UsersDependenciesContext;

export function useUsersDependencies(): UsersDependencies {
  const dependencies = useContext(UsersDependenciesContext);
  if (!dependencies) {
    throw new Error(
      "useUsersDependencies debe usarse dentro de UsersDependenciesProvider",
    );
  }
  return dependencies;
}
