import type { ITodoRepository } from '../todo.repository.interface';
import type { Todo } from '../../domain/todo.types';

let counter = 0;
const uuidv4 = () => `test-todo-${++counter}`;

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Map<string, Todo> = new Map();

  async create(
    todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Todo> {
    const now = new Date();
    const newTodo: Todo = {
      ...todoData,
      id: uuidv4(),
      priority: todoData.priority ?? now.getTime(),
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(newTodo.id, newTodo);
    return newTodo;
  }

  async findById(id: string): Promise<Todo | null> {
    return this.todos.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter((t) => t.userId === userId);
  }

  async findByListId(listId: string): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter((t) => t.listId === listId);
  }

  async update(
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Todo | null> {
    const todo = this.todos.get(id);
    if (!todo) return null;

    const updated = {
      ...todo,
      ...updates,
      updatedAt: new Date(),
    };
    this.todos.set(id, updated);
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  async findAll(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  clear(): void {
    this.todos.clear();
  }

  size(): number {
    return this.todos.size;
  }
}
