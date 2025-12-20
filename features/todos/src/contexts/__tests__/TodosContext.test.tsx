import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { TodosProvider, useBoard } from '../TodosContext';
import type { ApiClient, TodoContracts } from '@repo-pak/api-client';

const createMockApiClient = (): ApiClient =>
  ({
    createTodo: vi.fn(),
    getAllTodos: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    moveToList: vi.fn(),
    reorderTodo: vi.fn(),
  }) as unknown as ApiClient;

const createTodo = (
  id: string,
  title: string,
  listId: string
): TodoContracts.TodoResponseDto => ({
  id,
  title,
  listId,
  priority: 100,
  userId: 'user-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
});

describe('BoardContext', () => {
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <TodosProvider userId="user-1" apiClient={mockApiClient}>
      {children}
    </TodosProvider>
  );

  describe('initialization', () => {
    it('should fetch todos on mount', async () => {
      const todos = [createTodo('1', 'Test Todo', 'list-1')];
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue(todos);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toEqual(todos);
      });

      expect(mockApiClient.getAllTodos).toHaveBeenCalledWith('user-1');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error on mount', async () => {
      const error = new Error('Network error');
      vi.mocked(mockApiClient.getAllTodos).mockRejectedValue(error);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.todos).toEqual([]);
    });
  });

  describe('createTodo', () => {
    it('should create a new todo and add it to state', async () => {
      const newTodo = createTodo('2', 'New Todo', 'list-1');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([]);
      vi.mocked(mockApiClient.createTodo).mockResolvedValue(newTodo);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createTodo('New Todo', 'list-1', 'Description');
      });

      expect(mockApiClient.createTodo).toHaveBeenCalledWith(
        'New Todo',
        'user-1',
        'list-1',
        'Description'
      );
      expect(result.current.todos).toContainEqual(newTodo);
      expect(result.current.error).toBeNull();
    });

    it('should handle create error', async () => {
      const error = new Error('Create failed');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([]);
      vi.mocked(mockApiClient.createTodo).mockRejectedValue(error);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createTodo('New Todo', 'list-1');
        })
      ).rejects.toThrow('Create failed');
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const originalTodo = createTodo('1', 'Original', 'list-1');
      const updatedTodo = { ...originalTodo, title: 'Updated' };
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([originalTodo]);
      vi.mocked(mockApiClient.updateTodo).mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });

      await act(async () => {
        await result.current.updateTodo('1', { title: 'Updated' });
      });

      expect(mockApiClient.updateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated',
      });
      expect(result.current.todos[0].title).toBe('Updated');
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const todo = createTodo('1', 'Test', 'list-1');
      const error = new Error('Update failed');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([todo]);
      vi.mocked(mockApiClient.updateTodo).mockRejectedValue(error);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });

      await expect(
        act(async () => {
          await result.current.updateTodo('1', { title: 'Updated' });
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo and remove it from state', async () => {
      const todo1 = createTodo('1', 'Todo 1', 'list-1');
      const todo2 = createTodo('2', 'Todo 2', 'list-1');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([todo1, todo2]);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vi.mocked(mockApiClient.deleteTodo).mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteTodo('1');
      });

      expect(mockApiClient.deleteTodo).toHaveBeenCalledWith('1');
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].id).toBe('2');
      expect(result.current.error).toBeNull();
    });

    it('should handle delete error', async () => {
      const todo = createTodo('1', 'Test', 'list-1');
      const error = new Error('Delete failed');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([todo]);
      vi.mocked(mockApiClient.deleteTodo).mockRejectedValue(error);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });

      await expect(
        act(async () => {
          await result.current.deleteTodo('1');
        })
      ).rejects.toThrow('Delete failed');

      // Verify state wasn't changed on error
      expect(result.current.todos).toHaveLength(1);
    });
  });

  describe('moveToList', () => {
    it('should move todo to different list', async () => {
      const originalTodo = createTodo('1', 'Todo', 'list-1');
      const movedTodo = { ...originalTodo, listId: 'list-2' };
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([originalTodo]);
      vi.mocked(mockApiClient.moveToList).mockResolvedValue(movedTodo);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });

      await act(async () => {
        await result.current.moveToList('1', 'list-2');
      });

      expect(mockApiClient.moveToList).toHaveBeenCalledWith('1', 'list-2');
      expect(result.current.todos[0].listId).toBe('list-2');
      expect(result.current.error).toBeNull();
    });

    it('should handle move error', async () => {
      const todo = createTodo('1', 'Test', 'list-1');
      const error = new Error('Move failed');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([todo]);
      vi.mocked(mockApiClient.moveToList).mockRejectedValue(error);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });

      await expect(
        act(async () => {
          await result.current.moveToList('1', 'list-2');
        })
      ).rejects.toThrow('Move failed');
    });
  });

  describe('reorderTodo', () => {
    it('should reorder todo and refresh todos', async () => {
      const todo1 = createTodo('1', 'Todo 1', 'list-1');
      const todo2 = createTodo('2', 'Todo 2', 'list-1');
      const reorderedTodos = [todo2, todo1]; // Swapped order

      vi.mocked(mockApiClient.getAllTodos)
        .mockResolvedValueOnce([todo1, todo2])
        .mockResolvedValueOnce(reorderedTodos);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vi.mocked(mockApiClient.reorderTodo).mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(2);
      });

      await act(async () => {
        await result.current.reorderTodo('1', 200);
      });

      expect(mockApiClient.reorderTodo).toHaveBeenCalledWith(
        '1',
        200,
        'user-1'
      );
      expect(mockApiClient.getAllTodos).toHaveBeenCalledTimes(2);
      expect(result.current.todos).toEqual(reorderedTodos);
      expect(result.current.error).toBeNull();
    });

    it('should handle reorder error', async () => {
      const todo = createTodo('1', 'Test', 'list-1');
      const error = new Error('Reorder failed');
      vi.mocked(mockApiClient.getAllTodos).mockResolvedValue([todo]);
      vi.mocked(mockApiClient.reorderTodo).mockRejectedValue(error);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });

      await expect(
        act(async () => {
          await result.current.reorderTodo('1', 200);
        })
      ).rejects.toThrow('Reorder failed');
    });
  });

  describe('refreshTodos', () => {
    it('should refresh todos from API', async () => {
      const initialTodos = [createTodo('1', 'Initial', 'list-1')];
      const refreshedTodos = [
        createTodo('1', 'Updated', 'list-1'),
        createTodo('2', 'New', 'list-1'),
      ];

      vi.mocked(mockApiClient.getAllTodos)
        .mockResolvedValueOnce(initialTodos)
        .mockResolvedValueOnce(refreshedTodos);

      const { result } = renderHook(() => useBoard(), { wrapper });

      await waitFor(() => {
        expect(result.current.todos).toEqual(initialTodos);
      });

      await act(async () => {
        await result.current.refreshTodos();
      });

      expect(result.current.todos).toEqual(refreshedTodos);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useBoard hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useBoard());
      }).toThrow('useBoard must be used within a BoardProvider');
    });
  });
});
