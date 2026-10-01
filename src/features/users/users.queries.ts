import { infiniteQueryOptions, type InfiniteData } from "@tanstack/react-query";

import type { User } from "./user.model";
import type { UsersPage, UsersRepository } from "./users.repository";

export const usersListQueryKey = ["users", "list"] as const;

export interface UsersList {
  users: User[];
  usesFixture: boolean;
}

export function selectUsersList(
  data: InfiniteData<UsersPage, number>,
): UsersList {
  return {
    users: data.pages.flatMap((page) => page.users),
    usesFixture: data.pages.some((page) => page.source === "fixture"),
  };
}

export function usersListQueryOptions(usersRepository: UsersRepository) {
  return infiniteQueryOptions({
    queryKey: usersListQueryKey,
    queryFn: ({ pageParam, signal }) =>
      usersRepository.getPage({ page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    select: selectUsersList,
    // El dataset es inmutable (mismo seed): no hay nada que revalidar.
    staleTime: Infinity,
    // La resiliencia la da FallbackUsersRepository: a TanStack solo llegan cancelaciones
    // y bugs propios, y reintentarlos no sirve.
    retry: false,
  });
}
