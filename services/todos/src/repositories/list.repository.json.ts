import { JsonDB, Config } from 'node-json-db';
import type { IListRepository } from './list.repository.interface';
import type { List } from '../domain/list.types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class JsonListRepository implements IListRepository {
  private db: JsonDB;
  private readonly DB_PATH = '/data';

  constructor(dbFilePath?: string) {
    const dbPath = dbFilePath || path.join(process.cwd(), 'data', 'lists.json');
    const config = new Config(dbPath, true, true, '/');
    this.db = new JsonDB(config);
    this.initializeDb();
  }

  private initializeDb(): void {
    try {
      // Initialize empty lists array if it doesn't exist
      this.db.push(this.DB_PATH, [], false);
    } catch (error) {
      // Path already exists or other error, ignore
    }
  }

  async create(
    listData: Omit<List, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<List> {
    let lists: List[] = [];
    try {
      lists = (await this.db.getData(this.DB_PATH)) as List[];
    } catch (error) {
      // Path doesn't exist, start with empty array
      lists = [];
    }

    const now = new Date();

    const newList: List = {
      ...listData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    lists.push(newList);
    await this.db.push(this.DB_PATH, lists, true);

    return newList;
  }

  async findById(id: string): Promise<List | null> {
    let lists: List[] = [];
    try {
      lists = (await this.db.getData(this.DB_PATH)) as List[];
    } catch (error) {
      return null;
    }
    const list = lists.find((l) => l.id === id);
    return list || null;
  }

  async findByUserId(userId: string): Promise<List[]> {
    let lists: List[] = [];
    try {
      lists = (await this.db.getData(this.DB_PATH)) as List[];
    } catch (error) {
      return [];
    }
    return lists
      .filter((l) => l.userId === userId)
      .sort((a, b) => a.priority - b.priority); // Sort by priority ascending
  }

  async update(
    id: string,
    updates: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<List | null> {
    let lists: List[] = [];
    try {
      lists = (await this.db.getData(this.DB_PATH)) as List[];
    } catch (error) {
      return null;
    }
    const index = lists.findIndex((l) => l.id === id);

    if (index === -1) return null;

    lists[index] = {
      ...lists[index],
      ...updates,
      updatedAt: new Date(),
    };

    await this.db.push(this.DB_PATH, lists, true);
    return lists[index];
  }

  async deleteById(id: string): Promise<boolean> {
    let lists: List[] = [];
    try {
      lists = (await this.db.getData(this.DB_PATH)) as List[];
    } catch (error) {
      return false;
    }
    const index = lists.findIndex((l) => l.id === id);

    if (index === -1) return false;

    lists.splice(index, 1);
    await this.db.push(this.DB_PATH, lists, true);

    return true;
  }

  async findAll(): Promise<List[]> {
    let lists: List[] = [];
    try {
      lists = (await this.db.getData(this.DB_PATH)) as List[];
    } catch (error) {
      return [];
    }
    return lists;
  }
}
