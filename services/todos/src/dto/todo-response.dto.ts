import type { Todo } from '../domain/todo.types';

export interface TodoResponseDto {
  id: string;
  title: string;
  description?: string;
  listId?: string;
  priority: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function toTodoResponseDto(todo: Todo): TodoResponseDto {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    listId: todo.listId,
    priority: todo.priority,
    userId: todo.userId,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}
