import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { Users } from '@repo-feat/users';
import { ApiClient } from '@repo-pak/api-client';
import { ApiClientProvider } from './contexts/ApiClientContext';
import { GlobalStyles } from './styles/GlobalStyles';

const apiClient = new ApiClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStyles />
    <ApiClientProvider apiClient={apiClient}>
      <Users.Provider apiClient={apiClient}>
        <App apiClient={apiClient} />
      </Users.Provider>
    </ApiClientProvider>
  </StrictMode>
);
