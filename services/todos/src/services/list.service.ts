import type { IListRepository } from '../repositories/list.repository.interface';
import type { ITodoRepository } from '../repositories/todo.repository.interface';
import type { List } from '../domain/list.types';
import type { CreateListDto } from '../dto/create-list.dto';
import type { UpdateListDto } from '../dto/update-list.dto';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ListService {
  constructor(
    private listRepository: IListRepository,
    private todoRepository: ITodoRepository
  ) {}

  async createList(dto: CreateListDto): Promise<List> {
    // Get the highest priority for this user's lists to add new list at the end
    const userLists = await this.listRepository.findByUserId(dto.userId);
    const maxPriority = userLists.reduce(
      (max, list) => (list.priority > max ? list.priority : max),
      0
    );

    return await this.listRepository.create({
      name: dto.name,
      userId: dto.userId,
      priority: maxPriority + 1,
    });
  }

  async updateList(id: string, dto: UpdateListDto): Promise<List> {
    const updatedList = await this.listRepository.update(id, dto);
    if (!updatedList) {
      throw new NotFoundError(`List with id '${id}' not found`);
    }
    return updatedList;
  }

  async deleteList(id: string, userId: string): Promise<void> {
    const list = await this.getListById(id);

    // Validate ownership
    if (list.userId !== userId) {
      throw new NotFoundError(`List with id '${id}' not found`);
    }

    // Check if list has any todos
    const todos = await this.todoRepository.findByListId(id);
    if (todos.length > 0) {
      throw new ValidationError(
        'Cannot delete list with todos. Please move or delete todos first.'
      );
    }

    const deleted = await this.listRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`List with id '${id}' not found`);
    }
  }

  async getListById(id: string): Promise<List> {
    const list = await this.listRepository.findById(id);
    if (!list) {
      throw new NotFoundError(`List with id '${id}' not found`);
    }
    return list;
  }

  async getListsByUserId(userId: string): Promise<List[]> {
    // Repository already sorts by priority
    return await this.listRepository.findByUserId(userId);
  }

  async getAllLists(): Promise<List[]> {
    return await this.listRepository.findAll();
  }

  async reorderList(
    listId: string,
    newPriority: number,
    userId: string
  ): Promise<void> {
    const list = await this.getListById(listId);
    if (list.userId !== userId) {
      throw new NotFoundError(`List with id '${listId}' not found`);
    }

    const oldPriority = list.priority;

    // Update the dragged list's priority
    await this.listRepository.update(listId, { priority: newPriority });

    // Get all lists for this user
    const userLists = await this.listRepository.findByUserId(userId);
    const otherLists = userLists.filter((l) => l.id !== listId);

    // Adjust priorities of other lists
    for (const l of otherLists) {
      if (oldPriority < newPriority) {
        // Moving down: shift lists between old and new position up
        if (l.priority > oldPriority && l.priority <= newPriority) {
          await this.listRepository.update(l.id, { priority: l.priority - 1 });
        }
      } else {
        // Moving up: shift lists between new and old position down
        if (l.priority >= newPriority && l.priority < oldPriority) {
          await this.listRepository.update(l.id, { priority: l.priority + 1 });
        }
      }
    }
  }

  async ensureDefaultLists(userId: string): Promise<List[]> {
    const lists = await this.listRepository.findByUserId(userId);

    if (lists.length === 0) {
      // Create default lists
      const todoList = await this.listRepository.create({
        name: 'To Do',
        userId,
        priority: 1,
      });
      const inProgressList = await this.listRepository.create({
        name: 'In Progress',
        userId,
        priority: 2,
      });
      const doneList = await this.listRepository.create({
        name: 'Done',
        userId,
        priority: 3,
      });
      return [todoList, inProgressList, doneList];
    }

    return lists;
  }
}
