/** Forma de un usuario en la respuesta de randomuser.me, para los campos que pedimos con `inc`. */
export interface RandomUserDto {
  login: { uuid: string };
  name: { first: string; last: string };
  email: string;
  picture: { large: string; medium: string; thumbnail: string };
}

/** Cuando falla, la API responde con `error` en lugar de `results`. */
export interface RandomUserResponse {
  results?: RandomUserDto[];
  error?: string;
}
