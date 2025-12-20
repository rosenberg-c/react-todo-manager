import { useState, useEffect } from 'react';

import { Button, Feedback } from '@repo-pak/components';

import { useUsers } from '../contexts/UsersContext';
import { UserCreate } from './UserCreate';
import { UserList } from './UserList';
import { UserLogin } from './UserLogin';
import type { UserActions } from '../types/userActions';
import * as S from './User.styles';
import { MESSAGES } from './messages';

const SESSION_KEYS = {
  USER_ID: 'logged_in_user_id',
  USERNAME: 'logged_in_username',
};

export interface UserManagementProps {
  userActions: UserActions;
  renderLoggedIn?: (
    userId: string,
    username: string,
    onLogout: () => void
  ) => React.ReactNode;
}

export const UserManagement = ({
  userActions,
  renderLoggedIn,
}: UserManagementProps) => {
  const usersContext = useUsers();
  const { users, loading, error, login } = usersContext;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // We should of corse handle auth with cookie or token in real world
    const savedUserId = sessionStorage.getItem(SESSION_KEYS.USER_ID);
    const savedUsername = sessionStorage.getItem(SESSION_KEYS.USERNAME);

    if (savedUserId && savedUsername) {
      setIsLoggedIn(true);
      setCurrentUser(savedUsername);
      setCurrentUserId(savedUserId);
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoginError(null);
    try {
      const user = await login(username, password);
      setIsLoggedIn(true);
      setCurrentUser(user.username);
      setCurrentUserId(user.id);

      sessionStorage.setItem(SESSION_KEYS.USER_ID, user.id);
      sessionStorage.setItem(SESSION_KEYS.USERNAME, user.username);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentUserId(null);
    setLoginError(null);

    sessionStorage.removeItem(SESSION_KEYS.USER_ID);
    sessionStorage.removeItem(SESSION_KEYS.USERNAME);
  };

  // If logged in and custom render function is provided, use it
  if (isLoggedIn && currentUserId && currentUser && renderLoggedIn) {
    return <>{renderLoggedIn(currentUserId, currentUser, handleLogout)}</>;
  }

  return (
    <S.Container>
      <S.HeaderContainer>
        <S.Title>{MESSAGES.PAGE_TITLE}</S.Title>
        {isLoggedIn && currentUser && (
          <S.UserInfoHeader>
            <span>
              {MESSAGES.STATUS_LOGGED_IN_AS} <strong>{currentUser}</strong>
            </span>
            <Button.Primary onClick={handleLogout}>
              {MESSAGES.BUTTON_LOGOUT}
            </Button.Primary>
          </S.UserInfoHeader>
        )}
      </S.HeaderContainer>

      {!isLoggedIn && loginError && (
        <Feedback.ErrorBanner>{loginError}</Feedback.ErrorBanner>
      )}
      {isLoggedIn && error && (
        <Feedback.ErrorBanner>{error}</Feedback.ErrorBanner>
      )}

      {!isLoggedIn && (
        <>
          <S.FormsContainer>
            <S.Section>
              <S.SectionTitle>{MESSAGES.SECTION_LOGIN}</S.SectionTitle>
              <UserLogin onLogin={handleLogin} />
            </S.Section>

            <S.Section>
              <S.SectionTitle>{MESSAGES.SECTION_CREATE_USER}</S.SectionTitle>
              <UserCreate ctx={usersContext} />
            </S.Section>
          </S.FormsContainer>

          <S.UsersSection>
            <S.SectionTitle>
              {`${MESSAGES.SECTION_USERS} (${users.length})`}
            </S.SectionTitle>
            {loading && (
              <Feedback.Loading>{MESSAGES.STATUS_LOADING}</Feedback.Loading>
            )}
            <UserList
              users={users}
              ctx={usersContext}
              userActions={userActions}
            />
          </S.UsersSection>
        </>
      )}
    </S.Container>
  );
};
