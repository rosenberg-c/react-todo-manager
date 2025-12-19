import type { IListRepository } from '../list.repository.interface';
import type { List } from '../../domain/list.types';

// Simple UUID generator for testing
let counter = 0;
const uuidv4 = () => `test-list-${++counter}`;

export class InMemoryListRepository implements IListRepository {
  private lists: Map<string, List> = new Map();

  async create(
    listData: Omit<List, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<List> {
    const now = new Date();
    const newList: List = {
      ...listData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    this.lists.set(newList.id, newList);
    return newList;
  }

  async findById(id: string): Promise<List | null> {
    return this.lists.get(id) || null;
  }

  async findByUserId(userId: string): Promise<List[]> {
    return Array.from(this.lists.values())
      .filter((l) => l.userId === userId)
      .sort((a, b) => a.priority - b.priority);
  }

  async update(
    id: string,
    updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list) return null;

    const updated = {
      ...list,
      ...updates,
      updatedAt: new Date(),
    };
    this.lists.set(id, updated);
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.lists.delete(id);
  }

  async findAll(): Promise<List[]> {
    return Array.from(this.lists.values());
  }

  // Test helper methods
  clear(): void {
    this.lists.clear();
  }

  size(): number {
    return this.lists.size;
  }
}
