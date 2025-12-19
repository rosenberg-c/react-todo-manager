import type { ITodoRepository } from '../repositories/todo.repository.interface';
import type { Todo } from '../domain/todo.types';
import type { CreateTodoDto } from '../dto/create-todo.dto';
import type { UpdateTodoDto } from '../dto/update-todo.dto';
import { NotFoundError } from '../utils/errors';

export class TodoService {
  constructor(private todoRepository: ITodoRepository) {}

  async createTodo(dto: CreateTodoDto): Promise<Todo> {
    // Get the highest priority for this user's todos in this list to add new todo at the top
    const listTodos = await this.todoRepository.findByListId(dto.listId);
    const maxPriority = listTodos.reduce(
      (max, todo) => (todo.priority > max ? todo.priority : max),
      0
    );

    return await this.todoRepository.create({
      title: dto.title,
      description: dto.description,
      listId: dto.listId,
      userId: dto.userId,
      priority: maxPriority + 1,
    });
  }

  async updateTodo(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const updatedTodo = await this.todoRepository.update(id, dto);
    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id '${id}' not found`);
    }
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<void> {
    const deleted = await this.todoRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`Todo with id '${id}' not found`);
    }
  }

  async getTodoById(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundError(`Todo with id '${id}' not found`);
    }
    return todo;
  }

  async getTodosByUserId(userId: string): Promise<Todo[]> {
    return await this.todoRepository.findByUserId(userId);
  }

  async getAllTodos(): Promise<Todo[]> {
    return await this.todoRepository.findAll();
  }

  async moveToList(todoId: string, listId: string): Promise<Todo> {
    const todo = await this.getTodoById(todoId);

    // If already in the target list, do nothing
    if (todo.listId === listId) {
      return todo;
    }

    // Get todos in the target list to set priority
    const targetListTodos = await this.todoRepository.findByListId(listId);
    const maxPriority = targetListTodos.reduce(
      (max, t) => (t.priority > max ? t.priority : max),
      0
    );

    // Move todo to new list with highest priority (at the top)
    return await this.updateTodo(todoId, {
      listId,
      priority: maxPriority + 1,
    });
  }

  async reorderTodo(
    todoId: string,
    newPriority: number,
    userId: string
  ): Promise<void> {
    const todo = await this.getTodoById(todoId);
    if (todo.userId !== userId) {
      throw new NotFoundError(`Todo with id '${todoId}' not found`);
    }

    const oldPriority = todo.priority;

    // Update the dragged todo's priority
    await this.todoRepository.update(todoId, { priority: newPriority });

    // Get all todos in the same list
    const sameListTodos = todo.listId
      ? await this.todoRepository.findByListId(todo.listId)
      : [];
    const otherTodos = sameListTodos.filter((t) => t.id !== todoId);

    // Adjust priorities of other todos
    for (const t of otherTodos) {
      if (oldPriority < newPriority) {
        // Moving down: shift todos between old and new position up
        if (t.priority > oldPriority && t.priority <= newPriority) {
          await this.todoRepository.update(t.id, { priority: t.priority - 1 });
        }
      } else {
        // Moving up: shift todos between new and old position down
        if (t.priority >= newPriority && t.priority < oldPriority) {
          await this.todoRepository.update(t.id, { priority: t.priority + 1 });
        }
      }
    }
  }
}
