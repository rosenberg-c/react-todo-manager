import { JsonDB, Config } from 'node-json-db';
import type { ITodoRepository } from './todo.repository.interface';
import type { Todo } from '../domain/todo.types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class JsonTodoRepository implements ITodoRepository {
  private db: JsonDB;
  private readonly DB_PATH = '/data';

  constructor(dbFilePath?: string) {
    const dbPath = dbFilePath || path.join(process.cwd(), 'data', 'todos.json');
    const config = new Config(dbPath, true, true, '/');
    this.db = new JsonDB(config);
    this.initializeDb();
  }

  private initializeDb(): void {
    try {
      // Initialize empty todos array if it doesn't exist
      this.db.push(this.DB_PATH, [], false);
    } catch (error) {
      // Path already exists or other error, ignore
    }
  }

  async create(
    todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Todo> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      // Path doesn't exist, start with empty array
      todos = [];
    }

    const now = new Date();

    const newTodo: Todo = {
      ...todoData,
      id: uuidv4(),
      // If priority is not provided, use timestamp (higher = newer)
      priority: todoData.priority ?? now.getTime(),
      createdAt: now,
      updatedAt: now,
    };

    todos.push(newTodo);
    await this.db.push(this.DB_PATH, todos, true);

    return newTodo;
  }

  async findById(id: string): Promise<Todo | null> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      return null;
    }
    const todo = todos.find((t) => t.id === id);
    return todo || null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      return [];
    }
    return todos.filter((t) => t.userId === userId);
  }

  async findByListId(listId: string): Promise<Todo[]> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      return [];
    }
    return todos.filter((t) => t.listId === listId);
  }

  async update(
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Todo | null> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      return null;
    }
    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) return null;

    todos[index] = {
      ...todos[index],
      ...updates,
      updatedAt: new Date(),
    };

    await this.db.push(this.DB_PATH, todos, true);
    return todos[index];
  }

  async deleteById(id: string): Promise<boolean> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      return false;
    }
    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) return false;

    todos.splice(index, 1);
    await this.db.push(this.DB_PATH, todos, true);

    return true;
  }

  async findAll(): Promise<Todo[]> {
    let todos: Todo[] = [];
    try {
      todos = (await this.db.getData(this.DB_PATH)) as Todo[];
    } catch (error) {
      return [];
    }
    return todos;
  }
}
