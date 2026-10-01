import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { User } from "./user.model";
import { useUsersDependencies } from "./users.dependencies";
import { usersListQueryKey, usersListQueryOptions } from "./users.queries";

export interface UsersListState {
  users: User[];
  usesFixture: boolean;
  isPending: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  restart: () => void;
}

const NO_USERS: User[] = [];

/** Estado de la lista para la UI. TanStack Query queda confinado a este archivo y a users.queries.ts. */
export function useUsers(): UsersListState {
  const { usersRepository } = useUsersDependencies();
  const queryClient = useQueryClient();
  const query = useInfiniteQuery(usersListQueryOptions(usersRepository));

  return {
    users: query.data?.users ?? NO_USERS,
    usesFixture: query.data?.usesFixture ?? false,
    isPending: query.isPending,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: () => {
      // fetchNextPage cancela y reinicia la request en curso: sin esta guarda, un
      // onEndReached repetido abortaría páginas que ya se estaban pidiendo.
      if (query.hasNextPage && !query.isFetchingNextPage && !query.isError) {
        void query.fetchNextPage();
      }
    },
    // Vuelve a la primera página: refetch() repetiría una a una todas las ya cargadas.
    restart: () => {
      void queryClient.resetQueries({ queryKey: usersListQueryKey });
    },
  };
}
