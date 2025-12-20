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
  const {
    deleteUser,
    deleteTodosByUserId,
    deleteListsByUserId,
    getUserTodosCount,
    getUserListsCount,
    loading,
  } = ctx;
  const [deleting, setDeleting] = useState(false);
  const [deletingTodos, setDeletingTodos] = useState(false);
  const [deletingLists, setDeletingLists] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const [todosCount, listsCount] = await Promise.all([
        getUserTodosCount(user.id),
        getUserListsCount(user.id),
      ]);

      if (todosCount > 0) {
        alert(MESSAGES.ERROR_USER_HAS_TODOS(todosCount));
        setDeleting(false);
        return;
      }

      if (listsCount > 0) {
        alert(MESSAGES.ERROR_USER_HAS_LISTS(listsCount));
        setDeleting(false);
        return;
      }

      if (!confirm(MESSAGES.CONFIRM_DELETE_USER(user.username))) {
        setDeleting(false);
        return;
      }

      await deleteUser(user.id);
    } catch (_err) {
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
    } catch (_err) {
      alert(MESSAGES.ERROR_DELETE_TODOS_FAILED);
    } finally {
      setDeletingTodos(false);
    }
  };

  const handleDeleteLists = async () => {
    if (!confirm(MESSAGES.CONFIRM_DELETE_LISTS(user.username))) return;

    setDeletingLists(true);
    try {
      const count = await deleteListsByUserId(user.id);
      alert(MESSAGES.SUCCESS_DELETE_LISTS(count));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : MESSAGES.ERROR_DELETE_LISTS_FAILED;
      alert(message);
    } finally {
      setDeletingLists(false);
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
            disabled={loading || deleting || deletingTodos || deletingLists}
          >
            {deletingTodos
              ? MESSAGES.BUTTON_DELETING_TODOS
              : MESSAGES.BUTTON_DELETE_TODOS}
          </Button.Secondary>
          <Button.Secondary
            onClick={handleDeleteLists}
            disabled={loading || deleting || deletingTodos || deletingLists}
          >
            {deletingLists
              ? MESSAGES.BUTTON_DELETING_LISTS
              : MESSAGES.BUTTON_DELETE_LISTS}
          </Button.Secondary>
          <Button.Danger onClick={handleDelete} disabled={loading || deleting}>
            {deleting ? MESSAGES.BUTTON_DELETING : MESSAGES.BUTTON_DELETE}
          </Button.Danger>
        </S.ButtonGroup>
      </S.UserInfo>
    </S.UserItem>
  );
};
