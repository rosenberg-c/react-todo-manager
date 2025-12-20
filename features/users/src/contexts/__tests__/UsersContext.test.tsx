import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { UsersProvider, useUsers } from '../UsersContext';
import type { ApiClient, UserContracts } from '@repo-pak/api-client';

// Create a mock ApiClient
const createMockApiClient = (): ApiClient =>
  ({
    createUser: vi.fn(),
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
    login: vi.fn(),
  }) as unknown as ApiClient;

const createUser = (
  id: string,
  username: string
): UserContracts.UserResponseDto => ({
  id,
  username,
  createdAt: '2024-01-01',
});

describe('UsersContext', () => {
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <UsersProvider apiClient={mockApiClient}>{children}</UsersProvider>
  );

  describe('initialization', () => {
    it('should fetch users on mount', async () => {
      const users = [createUser('1', 'testuser')];
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue(users);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.users).toEqual(users);
      });

      expect(mockApiClient.getAllUsers).toHaveBeenCalledTimes(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error on mount', async () => {
      const error = new Error('Network error');
      vi.mocked(mockApiClient.getAllUsers).mockRejectedValue(error);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.users).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('should create a new user and add it to state', async () => {
      const newUser = createUser('2', 'newuser');
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue([]);
      vi.mocked(mockApiClient.createUser).mockResolvedValue(newUser);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createUser('newuser', 'password123');
      });

      expect(mockApiClient.createUser).toHaveBeenCalledWith(
        'newuser',
        'password123'
      );
      expect(result.current.users).toContainEqual(newUser);
      expect(result.current.error).toBeNull();
    });

    it('should handle create error', async () => {
      const error = new Error('User already exists');
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue([]);
      vi.mocked(mockApiClient.createUser).mockRejectedValue(error);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createUser('duplicate', 'password123');
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and remove it from state', async () => {
      const user1 = createUser('1', 'user1');
      const user2 = createUser('2', 'user2');
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue([user1, user2]);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      vi.mocked(mockApiClient.deleteUser).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.users).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteUser('1');
      });

      expect(mockApiClient.deleteUser).toHaveBeenCalledWith('1');
      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0].id).toBe('2');
      expect(result.current.error).toBeNull();
    });

    it('should handle delete error', async () => {
      const user = createUser('1', 'testuser');
      const error = new Error('Delete failed');
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue([user]);
      vi.mocked(mockApiClient.deleteUser).mockRejectedValue(error);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.users).toHaveLength(1);
      });

      await expect(
        act(async () => {
          await result.current.deleteUser('1');
        })
      ).rejects.toThrow('Delete failed');

      // Verify state wasn't changed on error
      expect(result.current.users).toHaveLength(1);
    });
  });

  describe('login', () => {
    it('should login and return user', async () => {
      const user = createUser('1', 'testuser');
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue([]);
      vi.mocked(mockApiClient.login).mockResolvedValue(user);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loggedInUser: UserContracts.UserResponseDto | null = null;
      await act(async () => {
        loggedInUser = await result.current.login('testuser', 'password123');
      });

      expect(mockApiClient.login).toHaveBeenCalledWith(
        'testuser',
        'password123'
      );
      expect(loggedInUser).toEqual(user);
      expect(result.current.error).toBeNull();
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(mockApiClient.getAllUsers).mockResolvedValue([]);
      vi.mocked(mockApiClient.login).mockRejectedValue(error);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('testuser', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshUsers', () => {
    it('should refresh users from API', async () => {
      const initialUsers = [createUser('1', 'user1')];
      const refreshedUsers = [
        createUser('1', 'user1'),
        createUser('2', 'user2'),
      ];

      vi.mocked(mockApiClient.getAllUsers)
        .mockResolvedValueOnce(initialUsers)
        .mockResolvedValueOnce(refreshedUsers);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.users).toEqual(initialUsers);
      });

      await act(async () => {
        await result.current.refreshUsers();
      });

      expect(result.current.users).toEqual(refreshedUsers);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useUsers hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useUsers());
      }).toThrow('useUsers must be used within a UsersProvider');
    });
  });
});
