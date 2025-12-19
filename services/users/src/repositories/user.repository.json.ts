import { JsonDB, Config } from 'node-json-db';
import type { IUserRepository } from './user.repository.interface';
import type { User } from '../domain/user.types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class JsonUserRepository implements IUserRepository {
  private db: JsonDB;
  private readonly DB_PATH = '/users';

  constructor(dbFilePath?: string) {
    const dbPath = dbFilePath || path.join(process.cwd(), 'data', 'users.json');
    const config = new Config(dbPath, true, true, '/');
    this.db = new JsonDB(config);
    this.initializeDb();
  }

  private initializeDb(): void {
    try {
      // Initialize empty users array if it doesn't exist
      this.db.push(this.DB_PATH, [], false);
    } catch (error) {
      // Path already exists or other error, ignore
    }
  }

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const users = (await this.db.getData(this.DB_PATH)) as User[];

    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    await this.db.push(this.DB_PATH, users);

    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    const users = (await this.db.getData(this.DB_PATH)) as User[];
    return users.find((u) => u.id === id) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = (await this.db.getData(this.DB_PATH)) as User[];
    if (!Array.isArray(users)) {
      console.error('getData returned non-array:', typeof users, users);
      return null;
    }
    return users.find((u) => u.username === username) || null;
  }

  async deleteById(id: string): Promise<boolean> {
    const users = (await this.db.getData(this.DB_PATH)) as User[];
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) return false;

    users.splice(index, 1);
    await this.db.push(this.DB_PATH, users);

    return true;
  }

  async findAll(): Promise<User[]> {
    return (await this.db.getData(this.DB_PATH)) as User[];
  }
}
