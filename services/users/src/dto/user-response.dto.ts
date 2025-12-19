import type { User } from '../domain/user.types';

export interface UserResponseDto {
  id: string;
  username: string;
  createdAt: string;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
}
