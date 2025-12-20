import { useCallback, useMemo } from 'react';

import type { UserActions } from '@repo-feat/users';

import { useApiClient } from '../contexts/ApiClientContext';
import { MESSAGES } from '../messages';

export const useUserActions = (): UserActions => {
  const apiClient = useApiClient();

  const confirmDeleteMessage = useCallback((username: string): string => {
    return MESSAGES.CONFIRM_DELETE_USER(username);
  }, []);

  const cleanupUserData = useCallback(
    async (userId: string): Promise<void> => {
      await apiClient.deleteTodosByUserId(userId);
      await apiClient.deleteListsByUserId(userId);
    },
    [apiClient]
  );

  return useMemo(
    () => ({
      confirmDeleteMessage,
      cleanupUserData,
    }),
    [confirmDeleteMessage, cleanupUserData]
  );
};
