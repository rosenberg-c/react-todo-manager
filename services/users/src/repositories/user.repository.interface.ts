import type { User } from '../domain/user.types';

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  findById(id: string): Promise<User | null>;

  findByUsername(username: string): Promise<User | null>;

  deleteById(id: string): Promise<boolean>;

  findAll(): Promise<User[]>;
}
