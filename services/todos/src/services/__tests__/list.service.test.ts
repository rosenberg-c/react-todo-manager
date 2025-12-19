import { ListService } from '../list.service';
import { InMemoryListRepository } from '../../repositories/__tests__/list.repository.memory';
import { InMemoryTodoRepository } from '../../repositories/__tests__/todo.repository.memory';
import { NotFoundError, ValidationError } from '../../utils/errors';

describe('ListService', () => {
  let listRepo: InMemoryListRepository;
  let todoRepo: InMemoryTodoRepository;
  let service: ListService;

  beforeEach(() => {
    listRepo = new InMemoryListRepository();
    todoRepo = new InMemoryTodoRepository();
    service = new ListService(listRepo, todoRepo);
  });

  describe('createList', () => {
    it('should create list with priority 1 when no lists exist', async () => {
      const list = await service.createList({
        name: 'My List',
        userId: 'user-1',
      });

      expect(list.priority).toBe(1);
      expect(list.name).toBe('My List');
      expect(list.userId).toBe('user-1');
      expect(list.id).toBeDefined();
      expect(list.createdAt).toBeInstanceOf(Date);
      expect(list.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-increment priority', async () => {
      await service.createList({ name: 'List 1', userId: 'user-1' });
      const list2 = await service.createList({
        name: 'List 2',
        userId: 'user-1',
      });
      const list3 = await service.createList({
        name: 'List 3',
        userId: 'user-1',
      });

      expect(list2.priority).toBe(2);
      expect(list3.priority).toBe(3);
    });

    it('should handle multiple users independently', async () => {
      await service.createList({ name: 'User 1 List', userId: 'user-1' });
      const user2List = await service.createList({
        name: 'User 2 List',
        userId: 'user-2',
      });

      expect(user2List.priority).toBe(1);
    });
  });

  describe('updateList', () => {
    it('should update list name', async () => {
      const list = await service.createList({
        name: 'Original',
        userId: 'user-1',
      });
      const updated = await service.updateList(list.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.id).toBe(list.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        list.updatedAt.getTime()
      );
    });

    it('should throw NotFoundError when list does not exist', async () => {
      await expect(
        service.updateList('nonexistent-id', { name: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteList', () => {
    it('should prevent deletion when list has todos', async () => {
      const list = await listRepo.create({
        name: 'My List',
        userId: 'user-1',
        priority: 1,
      });
      await todoRepo.create({
        title: 'Todo',
        userId: 'user-1',
        listId: list.id,
        priority: 1,
      });

      await expect(service.deleteList(list.id, 'user-1')).rejects.toThrow(
        ValidationError
      );
      await expect(service.deleteList(list.id, 'user-1')).rejects.toThrow(
        'Cannot delete list with todos'
      );
    });

    it('should delete list when no todos exist', async () => {
      const list = await listRepo.create({
        name: 'My List',
        userId: 'user-1',
        priority: 1,
      });

      await service.deleteList(list.id, 'user-1');

      expect(await listRepo.findById(list.id)).toBeNull();
    });

    it('should throw NotFoundError when deleting non-existent list', async () => {
      await expect(
        service.deleteList('nonexistent-id', 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should prevent deletion by non-owner', async () => {
      const list = await listRepo.create({
        name: 'My List',
        userId: 'user-1',
        priority: 1,
      });

      await expect(service.deleteList(list.id, 'user-2')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getListById', () => {
    it('should return list when it exists', async () => {
      const created = await service.createList({
        name: 'Test',
        userId: 'user-1',
      });
      const found = await service.getListById(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundError when list does not exist', async () => {
      await expect(service.getListById('nonexistent-id')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getListsByUserId', () => {
    it('should return lists sorted by priority', async () => {
      await service.createList({ name: 'List 1', userId: 'user-1' });
      await service.createList({ name: 'List 2', userId: 'user-1' });
      await service.createList({ name: 'List 3', userId: 'user-1' });

      const lists = await service.getListsByUserId('user-1');

      expect(lists).toHaveLength(3);
      expect(lists[0].priority).toBe(1);
      expect(lists[1].priority).toBe(2);
      expect(lists[2].priority).toBe(3);
    });

    it('should return only lists for specified user', async () => {
      await service.createList({ name: 'User 1 List', userId: 'user-1' });
      await service.createList({ name: 'User 2 List', userId: 'user-2' });

      const lists = await service.getListsByUserId('user-1');

      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe('User 1 List');
    });

    it('should return empty array when user has no lists', async () => {
      const lists = await service.getListsByUserId('user-1');

      expect(lists).toEqual([]);
    });
  });

  describe('reorderList', () => {
    it('should move list down (increase priority)', async () => {
      const list1 = await service.createList({
        name: 'List 1',
        userId: 'user-1',
      });
      const list2 = await service.createList({
        name: 'List 2',
        userId: 'user-1',
      });
      const list3 = await service.createList({
        name: 'List 3',
        userId: 'user-1',
      });

      // Move list1 (priority 1) to position 3
      await service.reorderList(list1.id, 3, 'user-1');

      const lists = await service.getListsByUserId('user-1');
      const reordered = lists.map((l) => ({ id: l.id, priority: l.priority }));

      expect(reordered).toEqual([
        { id: list2.id, priority: 1 }, // Shifted up
        { id: list3.id, priority: 2 }, // Shifted up
        { id: list1.id, priority: 3 }, // Moved here
      ]);
    });

    it('should move list up (decrease priority)', async () => {
      const list1 = await service.createList({
        name: 'List 1',
        userId: 'user-1',
      });
      const list2 = await service.createList({
        name: 'List 2',
        userId: 'user-1',
      });
      const list3 = await service.createList({
        name: 'List 3',
        userId: 'user-1',
      });

      // Move list3 (priority 3) to position 1
      await service.reorderList(list3.id, 1, 'user-1');

      const lists = await service.getListsByUserId('user-1');
      const reordered = lists.map((l) => ({ id: l.id, priority: l.priority }));

      expect(reordered).toEqual([
        { id: list3.id, priority: 1 }, // Moved here
        { id: list1.id, priority: 2 }, // Shifted down
        { id: list2.id, priority: 3 }, // Shifted down
      ]);
    });

    it('should throw NotFoundError when list does not exist', async () => {
      await expect(
        service.reorderList('nonexistent-id', 1, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should prevent reordering by non-owner', async () => {
      const list = await service.createList({
        name: 'List 1',
        userId: 'user-1',
      });

      await expect(service.reorderList(list.id, 1, 'user-2')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('ensureDefaultLists', () => {
    it('should create 3 default lists when none exist', async () => {
      const lists = await service.ensureDefaultLists('user-1');

      expect(lists).toHaveLength(3);
      expect(lists[0].name).toBe('To Do');
      expect(lists[0].priority).toBe(1);
      expect(lists[1].name).toBe('In Progress');
      expect(lists[1].priority).toBe(2);
      expect(lists[2].name).toBe('Done');
      expect(lists[2].priority).toBe(3);

      lists.forEach((list) => {
        expect(list.userId).toBe('user-1');
        expect(list.id).toBeDefined();
      });
    });

    it('should return existing lists without creating new ones', async () => {
      await service.createList({ name: 'Custom', userId: 'user-1' });

      const lists = await service.ensureDefaultLists('user-1');

      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe('Custom');
    });

    it('should not affect other users', async () => {
      await service.createList({ name: 'User 2 List', userId: 'user-2' });

      const lists = await service.ensureDefaultLists('user-1');

      expect(lists).toHaveLength(3);
      expect(await service.getListsByUserId('user-2')).toHaveLength(1);
    });
  });

  describe('getAllLists', () => {
    it('should return all lists across all users', async () => {
      await service.createList({ name: 'User 1 List', userId: 'user-1' });
      await service.createList({ name: 'User 2 List', userId: 'user-2' });

      const lists = await service.getAllLists();

      expect(lists).toHaveLength(2);
    });

    it('should return empty array when no lists exist', async () => {
      const lists = await service.getAllLists();

      expect(lists).toEqual([]);
    });
  });
});
