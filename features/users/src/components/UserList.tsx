import type { UserContracts } from '@repo-pak/api-client';
import { Feedback } from '@repo-pak/components';

import { UserItem } from './UserItem';
import * as S from './User.styles';
import { MESSAGES } from './messages';
import type { useUsers } from '../contexts/UsersContext';
import type { UserActions } from '../types/userActions';

interface UserListProps {
  users: UserContracts.UserResponseDto[];
  ctx: ReturnType<typeof useUsers>;
  userActions: UserActions;
}

export const UserList = ({ users, ctx, userActions }: UserListProps) => {
  if (users.length === 0) {
    return <Feedback.EmptyState>{MESSAGES.EMPTY_NO_USERS}</Feedback.EmptyState>;
  }

  return (
    <S.UserList>
      {users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          ctx={ctx}
          userActions={userActions}
        />
      ))}
    </S.UserList>
  );
};
