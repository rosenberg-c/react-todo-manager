import type { Todo } from '../domain/todo.types';

export interface ITodoRepository {
  create(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo>;

  findById(id: string): Promise<Todo | null>;

  findByUserId(userId: string): Promise<Todo[]>;

  findByListId(listId: string): Promise<Todo[]>;

  update(
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Todo | null>;

  deleteById(id: string): Promise<boolean>;

  findAll(): Promise<Todo[]>;
}
