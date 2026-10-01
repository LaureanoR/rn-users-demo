export const USERS_PAGE_SIZE = 100;
export const USERS_TOTAL = 2000;

/** La API no informa un total y generaría páginas infinitas: el tope lo fijamos acá. */
export function getNextPage(page: number): number | null {
  return page * USERS_PAGE_SIZE < USERS_TOTAL ? page + 1 : null;
}
