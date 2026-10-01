import type { RandomUserDto } from "./random-user.dto";
import type { User } from "./user.model";

export function toUser(dto: RandomUserDto): User {
  return {
    id: dto.login.uuid,
    fullName: `${dto.name.first} ${dto.name.last}`,
    email: dto.email,
    avatarUrl: dto.picture.large,
  };
}
