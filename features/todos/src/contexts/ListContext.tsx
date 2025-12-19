import type { PropsWithChildren } from 'react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { ApiClient } from '@repo-pak/api-client';
import type { ListContracts } from '@repo-pak/api-client';

export interface ListContextType {
  lists: ListContracts.ListResponseDto[];
  loading: boolean;
  error: string | null;
  createList: (name: string) => Promise<void>;
  updateList: (id: string, updates: { name?: string }) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderList: (id: string, newPriority: number) => Promise<void>;
  refreshLists: () => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const useLists = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useLists must be used within a ListProvider');
  }
  return context;
};

export interface ListProviderProps {
  userId: string;
  apiClient: ApiClient;
}

export const ListProvider = ({
  children,
  userId,
  apiClient,
}: PropsWithChildren<ListProviderProps>) => {
  const [lists, setLists] = useState<ListContracts.ListResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createList = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);
      try {
        const newList = await apiClient.createList(name, userId);
        setLists((prev) => {
          const updated = [...prev, newList].sort(
            (a, b) => a.priority - b.priority
          );
          return updated;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create list';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId]
  );

  const updateList = useCallback(
    async (id: string, updates: { name?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const updatedList = await apiClient.updateList(id, updates);
        setLists((prev) =>
          prev
            .map((list) => (list.id === id ? updatedList : list))
            .sort((a, b) => a.priority - b.priority)
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update list';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  const deleteList = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.deleteList(id, userId);
        setLists((prev) => prev.filter((list) => list.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete list';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId]
  );

  const refreshLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allLists = await apiClient.getAllLists(userId);
      setLists(allLists.sort((a, b) => a.priority - b.priority));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch lists';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiClient, userId]);

  const reorderList = useCallback(
    async (id: string, newPriority: number) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.reorderList(id, newPriority, userId);
        await refreshLists();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to reorder list';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId, refreshLists]
  );

  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  return (
    <ListContext.Provider
      value={{
        lists,
        loading,
        error,
        createList,
        updateList,
        deleteList,
        reorderList,
        refreshLists,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
