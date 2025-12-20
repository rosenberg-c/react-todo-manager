import { useState } from 'react';

import { Button } from '@repo-pak/components';
import type { UserContracts } from '@repo-pak/api-client';

import type { useUsers } from '../contexts/UsersContext';
import type { UserActions } from '../types/userActions';
import * as S from './User.styles';
import { MESSAGES } from './messages';

interface UserItemProps {
  user: UserContracts.UserResponseDto;
  ctx: ReturnType<typeof useUsers>;
  userActions: UserActions;
}

export const UserItem = ({ user, ctx, userActions }: UserItemProps) => {
  const { deleteUser, loading } = ctx;
  const { confirmDeleteMessage, cleanupUserData } = userActions;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(confirmDeleteMessage(user.username))) {
      return;
    }

    setDeleting(true);
    try {
      await cleanupUserData(user.id);
      await deleteUser(user.id);
    } catch (_err) {
      alert(MESSAGES.ERROR_DELETE_USER_FAILED);
      setDeleting(false);
    }
  };

  return (
    <S.UserItem>
      <S.UserInfo>
        <S.UserUsername>{user.username}</S.UserUsername>
        <S.UserDetail>{`${MESSAGES.LABEL_USER_ID} ${user.id}`}</S.UserDetail>
        <S.UserDetail>
          {`${MESSAGES.LABEL_USER_CREATED} ${new Date(user.createdAt).toLocaleString('sv-SE')}`}
        </S.UserDetail>
        <S.ButtonGroup>
          <Button.Danger onClick={handleDelete} disabled={loading || deleting}>
            {deleting ? MESSAGES.BUTTON_DELETING : MESSAGES.BUTTON_DELETE}
          </Button.Danger>
        </S.ButtonGroup>
      </S.UserInfo>
    </S.UserItem>
  );
};
