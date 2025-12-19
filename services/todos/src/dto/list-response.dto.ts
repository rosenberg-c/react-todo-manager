import type { List } from '../domain/list.types';

export interface ListResponseDto {
  id: string;
  name: string;
  userId: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export function toListResponseDto(list: List): ListResponseDto {
  return {
    id: list.id,
    name: list.name,
    userId: list.userId,
    priority: list.priority,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}
