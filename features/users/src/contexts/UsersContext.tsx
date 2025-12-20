import type { PropsWithChildren } from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { ApiClient } from '@repo-pak/api-client';
import type { UserContracts } from '@repo-pak/api-client';

export interface UsersContextType {
  users: UserContracts.UserResponseDto[];
  loading: boolean;
  error: string | null;
  createUser: (username: string, password: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  deleteTodosByUserId: (userId: string) => Promise<number>;
  getUserTodosCount: (userId: string) => Promise<number>;
  getUserListsCount: (userId: string) => Promise<number>;
  refreshUsers: () => Promise<void>;
  login: (
    username: string,
    password: string
  ) => Promise<UserContracts.UserResponseDto>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};

export interface UsersProviderProps {
  apiClient: ApiClient;
}

export const UsersProvider = ({
  children,
  apiClient,
}: PropsWithChildren<UsersProviderProps>) => {
  const [users, setUsers] = useState<UserContracts.UserResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const newUser = await apiClient.createUser(username, password);
        setUsers((prev) => [...prev, newUser]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const deleteTodosByUserId = useCallback(
    async (userId: string): Promise<number> => {
      setLoading(true);
      setError(null);
      try {
        const deletedCount = await apiClient.deleteTodosByUserId(userId);
        return deletedCount;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete todos';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const getUserTodosCount = useCallback(
    async (userId: string): Promise<number> => {
      try {
        const todos = await apiClient.getAllTodos(userId);
        return todos.length;
      } catch {
        return 0;
      }
    },
    [apiClient]
  );

  const getUserListsCount = useCallback(
    async (userId: string): Promise<number> => {
      try {
        const lists = await apiClient.getAllLists(userId);
        return lists.length;
      } catch {
        return 0;
      }
    },
    [apiClient]
  );

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await apiClient.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<UserContracts.UserResponseDto> => {
      setLoading(true);
      setError(null);
      try {
        const user = await apiClient.login(username, password);
        return user;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to login';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        createUser,
        deleteUser,
        deleteTodosByUserId,
        getUserTodosCount,
        getUserListsCount,
        refreshUsers,
        login,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
