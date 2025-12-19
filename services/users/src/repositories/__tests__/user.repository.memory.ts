import type { IUserRepository } from '../user.repository.interface';
import type { User } from '../../domain/user.types';

let counter = 0;
const uuidv4 = () => `test-user-${++counter}`;

/**
 * In-memory implementation of IUserRepository for testing.
 * Uses a Map for fast lookups and no file I/O.
 */
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find((u) => u.username === username) || null;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  clear(): void {
    this.users.clear();
  }

  size(): number {
    return this.users.size;
  }
}
