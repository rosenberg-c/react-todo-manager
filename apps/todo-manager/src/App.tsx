import { Users } from '@repo-feat/users';
import { Todos } from '@repo-feat/todos';
import { Button } from '@repo-pak/components';
import type { ApiClient } from '@repo-pak/api-client';

import './App.css';

interface AppProps {
  apiClient: ApiClient;
}

export const App = ({ apiClient }: AppProps) => {
  return (
    <>
      <Users.Management
        renderLoggedIn={(userId, username, onLogout) => (
          <Todos.BoardProvider userId={userId} apiClient={apiClient}>
            <Todos.ListProvider userId={userId} apiClient={apiClient}>
              <div style={{ padding: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    maxWidth: '1400px',
                    margin: '0 auto 20px',
                  }}
                >
                  <h2 style={{ margin: 0 }}>
                    Welcome, <strong>{username}</strong>
                  </h2>
                  <Button.Primary onClick={onLogout}>Logout</Button.Primary>
                </div>
                <Todos.TaskBoard />
              </div>
            </Todos.ListProvider>
          </Todos.BoardProvider>
        )}
      />
    </>
  );
};
