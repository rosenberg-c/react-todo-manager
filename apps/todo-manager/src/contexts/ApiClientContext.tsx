import { createContext, useContext, type PropsWithChildren } from 'react';

import type { ApiClient } from '@repo-pak/api-client';

const ApiClientContext = createContext<ApiClient | null>(null);

export const useApiClient = () => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context;
};

interface ApiClientProviderProps {
  apiClient: ApiClient;
}

export const ApiClientProvider = ({
  children,
  apiClient,
}: PropsWithChildren<ApiClientProviderProps>) => {
  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
};
