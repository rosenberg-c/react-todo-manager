import type { List } from '../domain/list.types';

export interface IListRepository {
  create(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<List>;

  findById(id: string): Promise<List | null>;

  findByUserId(userId: string): Promise<List[]>;

  update(
    id: string,
    updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<List | null>;

  deleteById(id: string): Promise<boolean>;

  findAll(): Promise<List[]>;
}
