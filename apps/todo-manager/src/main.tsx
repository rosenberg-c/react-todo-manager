import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { Users } from '@repo-feat/users';
import { ApiClient } from '@repo-pak/api-client';

import './index.css';

const apiClient = new ApiClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Users.Provider apiClient={apiClient}>
      <App apiClient={apiClient} />
    </Users.Provider>
  </StrictMode>
);
