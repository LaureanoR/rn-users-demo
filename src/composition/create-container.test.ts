import { usersListQueryKey } from "@/features/users/users.queries";

import { createContainer } from "./create-container";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

describe("createContainer", () => {
  it("al cerrar sesión vacía la caché, para que el próximo usuario no vea datos ajenos", () => {
    const { queryClient, auth } = createContainer();
    queryClient.setQueryData(usersListQueryKey, { pages: [], pageParams: [] });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1);

    auth.onSignedOut?.();

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it("cada contenedor tiene su propio QueryClient", () => {
    expect(createContainer().queryClient).not.toBe(
      createContainer().queryClient,
    );
  });
});
