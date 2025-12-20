import { useState } from 'react';

import { Button } from '@repo-pak/components';
import type { UserContracts } from '@repo-pak/api-client';

import type { useUsers } from '../contexts/UsersContext';
import * as S from './User.styles';
import { MESSAGES } from './messages';

interface UserItemProps {
  user: UserContracts.UserResponseDto;
  ctx: ReturnType<typeof useUsers>;
}

export const UserItem = ({ user, ctx }: UserItemProps) => {
  const { deleteUser, deleteTodosByUserId, getUserTodosCount, loading } = ctx;
  const [deleting, setDeleting] = useState(false);
  const [deletingTodos, setDeletingTodos] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const todosCount = await getUserTodosCount(user.id);
      if (todosCount > 0) {
        alert(MESSAGES.ERROR_USER_HAS_TODOS(todosCount));
        setDeleting(false);
        return;
      }

      if (!confirm(MESSAGES.CONFIRM_DELETE_USER(user.username))) {
        setDeleting(false);
        return;
      }

      await deleteUser(user.id);
    } catch (err) {
      alert(MESSAGES.ERROR_DELETE_USER_FAILED);
      setDeleting(false);
    }
  };

  const handleDeleteTodos = async () => {
    if (!confirm(MESSAGES.CONFIRM_DELETE_TODOS(user.username))) return;

    setDeletingTodos(true);
    try {
      const count = await deleteTodosByUserId(user.id);
      alert(MESSAGES.SUCCESS_DELETE_TODOS(count));
    } catch (err) {
      alert(MESSAGES.ERROR_DELETE_TODOS_FAILED);
    } finally {
      setDeletingTodos(false);
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
          <Button.Secondary
            onClick={handleDeleteTodos}
            disabled={loading || deleting || deletingTodos}
          >
            {deletingTodos
              ? MESSAGES.BUTTON_DELETING_TODOS
              : MESSAGES.BUTTON_DELETE_TODOS}
          </Button.Secondary>
          <Button.Danger onClick={handleDelete} disabled={loading || deleting}>
            {deleting ? MESSAGES.BUTTON_DELETING : MESSAGES.BUTTON_DELETE}
          </Button.Danger>
        </S.ButtonGroup>
      </S.UserInfo>
    </S.UserItem>
  );
};
