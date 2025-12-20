import { Users } from '@repo-feat/users';
import { Todos } from '@repo-feat/todos';
import { Button } from '@repo-pak/components';
import type { ApiClient } from '@repo-pak/api-client';
import { useUserActions } from './hooks/useUserActions';
import { MESSAGES } from './messages';
import * as S from './styles/App.styles';

interface AppProps {
  apiClient: ApiClient;
}

export const App = ({ apiClient }: AppProps) => {
  const userActions = useUserActions();

  return (
    <Users.Management
      userActions={userActions}
      renderLoggedIn={(userId, username, onLogout) => (
        <Todos.TodosProvider userId={userId} apiClient={apiClient}>
          <Todos.ListProvider userId={userId} apiClient={apiClient}>
            <S.LoggedInContainer>
              <S.Header>
                <S.WelcomeTitle>{MESSAGES.WELCOME(username)}</S.WelcomeTitle>
                <Button.Primary onClick={onLogout}>
                  {MESSAGES.BUTTON_LOGOUT}
                </Button.Primary>
              </S.Header>
              <Todos.TaskBoard />
            </S.LoggedInContainer>
          </Todos.ListProvider>
        </Todos.TodosProvider>
      )}
    />
  );
};
