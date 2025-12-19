import { TodoService } from '../todo.service';
import { InMemoryTodoRepository } from '../../repositories/__tests__/todo.repository.memory';
import { NotFoundError } from '../../utils/errors';

describe('TodoService', () => {
  let todoRepo: InMemoryTodoRepository;
  let service: TodoService;

  beforeEach(() => {
    todoRepo = new InMemoryTodoRepository();
    service = new TodoService(todoRepo);
  });

  describe('createTodo', () => {
    it('should create todo with priority 1 when list is empty', async () => {
      const todo = await service.createTodo({
        title: 'My Todo',
        userId: 'user-1',
        listId: 'list-1',
      });

      expect(todo.priority).toBe(1);
      expect(todo.title).toBe('My Todo');
      expect(todo.userId).toBe('user-1');
      expect(todo.listId).toBe('list-1');
      expect(todo.id).toBeDefined();
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-increment priority within the same list', async () => {
      await service.createTodo({
        title: 'Todo 1',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todo2 = await service.createTodo({
        title: 'Todo 2',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todo3 = await service.createTodo({
        title: 'Todo 3',
        userId: 'user-1',
        listId: 'list-1',
      });

      expect(todo2.priority).toBe(2);
      expect(todo3.priority).toBe(3);
    });

    it('should handle priorities independently across different lists', async () => {
      await service.createTodo({
        title: 'Todo in List 1',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todoInList2 = await service.createTodo({
        title: 'Todo in List 2',
        userId: 'user-1',
        listId: 'list-2',
      });

      expect(todoInList2.priority).toBe(1);
    });

    it('should support optional description', async () => {
      const todo = await service.createTodo({
        title: 'My Todo',
        description: 'My Description',
        userId: 'user-1',
        listId: 'list-1',
      });

      expect(todo.description).toBe('My Description');
    });
  });

  describe('updateTodo', () => {
    it('should update todo title', async () => {
      const todo = await service.createTodo({
        title: 'Original',
        userId: 'user-1',
        listId: 'list-1',
      });
      const updated = await service.updateTodo(todo.id, { title: 'Updated' });

      expect(updated.title).toBe('Updated');
      expect(updated.id).toBe(todo.id);
    });

    it('should update todo description', async () => {
      const todo = await service.createTodo({
        title: 'Todo',
        userId: 'user-1',
        listId: 'list-1',
      });
      const updated = await service.updateTodo(todo.id, {
        description: 'New Description',
      });

      expect(updated.description).toBe('New Description');
    });

    it('should throw NotFoundError when todo does not exist', async () => {
      await expect(
        service.updateTodo('nonexistent-id', { title: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', async () => {
      const todo = await service.createTodo({
        title: 'Todo',
        userId: 'user-1',
        listId: 'list-1',
      });

      await service.deleteTodo(todo.id);

      expect(await todoRepo.findById(todo.id)).toBeNull();
    });

    it('should throw NotFoundError when deleting non-existent todo', async () => {
      await expect(service.deleteTodo('nonexistent-id')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getTodoById', () => {
    it('should return todo when it exists', async () => {
      const created = await service.createTodo({
        title: 'Test',
        userId: 'user-1',
        listId: 'list-1',
      });
      const found = await service.getTodoById(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundError when todo does not exist', async () => {
      await expect(service.getTodoById('nonexistent-id')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getTodosByUserId', () => {
    it('should return all todos for a user', async () => {
      await service.createTodo({
        title: 'Todo 1',
        userId: 'user-1',
        listId: 'list-1',
      });
      await service.createTodo({
        title: 'Todo 2',
        userId: 'user-1',
        listId: 'list-2',
      });
      await service.createTodo({
        title: 'Todo 3',
        userId: 'user-2',
        listId: 'list-1',
      });

      const todos = await service.getTodosByUserId('user-1');

      expect(todos).toHaveLength(2);
      expect(todos.every((t) => t.userId === 'user-1')).toBe(true);
    });

    it('should return empty array when user has no todos', async () => {
      const todos = await service.getTodosByUserId('user-1');

      expect(todos).toEqual([]);
    });
  });

  describe('getAllTodos', () => {
    it('should return all todos across all users', async () => {
      await service.createTodo({
        title: 'Todo 1',
        userId: 'user-1',
        listId: 'list-1',
      });
      await service.createTodo({
        title: 'Todo 2',
        userId: 'user-2',
        listId: 'list-2',
      });

      const todos = await service.getAllTodos();

      expect(todos).toHaveLength(2);
    });

    it('should return empty array when no todos exist', async () => {
      const todos = await service.getAllTodos();

      expect(todos).toEqual([]);
    });
  });

  describe('moveToList', () => {
    it('should move todo to different list and update priority', async () => {
      const todo = await service.createTodo({
        title: 'Todo',
        userId: 'user-1',
        listId: 'list-1',
      });

      const moved = await service.moveToList(todo.id, 'list-2');

      expect(moved.listId).toBe('list-2');
      expect(moved.priority).toBe(1);
      expect(moved.id).toBe(todo.id);
    });

    it('should set priority correctly when target list has todos', async () => {
      await service.createTodo({
        title: 'Existing',
        userId: 'user-1',
        listId: 'list-2',
      });
      await service.createTodo({
        title: 'Existing 2',
        userId: 'user-1',
        listId: 'list-2',
      });

      const todo = await service.createTodo({
        title: 'To Move',
        userId: 'user-1',
        listId: 'list-1',
      });

      const moved = await service.moveToList(todo.id, 'list-2');

      expect(moved.listId).toBe('list-2');
      expect(moved.priority).toBe(3); // Should be added at the end
    });

    it('should return todo unchanged when already in target list', async () => {
      const todo = await service.createTodo({
        title: 'Todo',
        userId: 'user-1',
        listId: 'list-1',
      });

      const result = await service.moveToList(todo.id, 'list-1');

      expect(result).toEqual(todo);
    });

    it('should throw NotFoundError when todo does not exist', async () => {
      await expect(
        service.moveToList('nonexistent-id', 'list-1')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('reorderTodo', () => {
    it('should move todo down (increase priority) within same list', async () => {
      const todo1 = await service.createTodo({
        title: 'Todo 1',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todo2 = await service.createTodo({
        title: 'Todo 2',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todo3 = await service.createTodo({
        title: 'Todo 3',
        userId: 'user-1',
        listId: 'list-1',
      });

      // Move todo1 (priority 1) to position 3
      await service.reorderTodo(todo1.id, 3, 'user-1');

      const todos = await todoRepo.findByListId('list-1');
      const sorted = todos.sort((a, b) => a.priority - b.priority);

      expect(sorted.map((t) => ({ id: t.id, priority: t.priority }))).toEqual([
        { id: todo2.id, priority: 1 }, // Shifted up
        { id: todo3.id, priority: 2 }, // Shifted up
        { id: todo1.id, priority: 3 }, // Moved here
      ]);
    });

    it('should move todo up (decrease priority) within same list', async () => {
      const todo1 = await service.createTodo({
        title: 'Todo 1',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todo2 = await service.createTodo({
        title: 'Todo 2',
        userId: 'user-1',
        listId: 'list-1',
      });
      const todo3 = await service.createTodo({
        title: 'Todo 3',
        userId: 'user-1',
        listId: 'list-1',
      });

      // Move todo3 (priority 3) to position 1
      await service.reorderTodo(todo3.id, 1, 'user-1');

      const todos = await todoRepo.findByListId('list-1');
      const sorted = todos.sort((a, b) => a.priority - b.priority);

      expect(sorted.map((t) => ({ id: t.id, priority: t.priority }))).toEqual([
        { id: todo3.id, priority: 1 }, // Moved here
        { id: todo1.id, priority: 2 }, // Shifted down
        { id: todo2.id, priority: 3 }, // Shifted down
      ]);
    });

    it('should throw NotFoundError when todo does not exist', async () => {
      await expect(
        service.reorderTodo('nonexistent-id', 1, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should prevent reordering by non-owner', async () => {
      const todo = await service.createTodo({
        title: 'Todo',
        userId: 'user-1',
        listId: 'list-1',
      });

      await expect(service.reorderTodo(todo.id, 1, 'user-2')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
