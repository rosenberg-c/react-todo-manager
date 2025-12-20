import type { PropsWithChildren } from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { ApiClient } from '@repo-pak/api-client';
import type { TodoContracts } from '@repo-pak/api-client';

export interface TodosContextType {
  todos: TodoContracts.TodoResponseDto[];
  loading: boolean;
  error: string | null;
  createTodo: (
    title: string,
    listId: string,
    description?: string
  ) => Promise<void>;
  updateTodo: (
    id: string,
    updates: {
      title?: string;
      description?: string;
      listId?: string;
    }
  ) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  moveToList: (id: string, listId: string) => Promise<void>;
  reorderTodo: (id: string, newPriority: number) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

const BoardContext = createContext<TodosContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export interface BoardProviderProps {
  userId: string;
  apiClient: ApiClient;
}

export const TodosProvider = ({
  children,
  userId,
  apiClient,
}: PropsWithChildren<BoardProviderProps>) => {
  const [todos, setTodos] = useState<TodoContracts.TodoResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTodo = useCallback(
    async (title: string, listId: string, description?: string) => {
      setLoading(true);
      setError(null);
      try {
        const newTodo = await apiClient.createTodo(
          title,
          userId,
          listId,
          description
        );
        setTodos((prev) => [...prev, newTodo]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create todo';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId]
  );

  const updateTodo = useCallback(
    async (
      id: string,
      updates: {
        title?: string;
        description?: string;
        listId?: string;
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTodo = await apiClient.updateTodo(id, updates);
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update todo';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.deleteTodo(id);
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete todo';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const moveToList = useCallback(
    async (id: string, listId: string) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTodo = await apiClient.moveToList(id, listId);
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to move todo';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const refreshTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allTodos = await apiClient.getAllTodos(userId);
      setTodos(allTodos);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch todos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiClient, userId]);

  const reorderTodo = useCallback(
    async (id: string, newPriority: number) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.reorderTodo(id, newPriority, userId);
        await refreshTodos();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to reorder todo';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId, refreshTodos]
  );

  useEffect(() => {
    refreshTodos();
  }, [refreshTodos]);

  return (
    <BoardContext.Provider
      value={{
        todos,
        loading,
        error,
        createTodo,
        updateTodo,
        deleteTodo,
        moveToList,
        reorderTodo,
        refreshTodos,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
