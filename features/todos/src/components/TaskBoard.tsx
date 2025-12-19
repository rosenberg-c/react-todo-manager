import { useMemo, useState } from 'react';
import { Feedback } from '@repo-pak/components';
import { useBoard } from '../contexts/TodosContext';
import { useLists } from '../contexts/ListContext';
import { ListColumn } from './list/ListColumn';
import { CreateListForm } from './list/CreateListForm';
import { SearchBar } from './SearchBar';
import * as S from './Todos.styles';
import { MESSAGES } from './messages';
import { groupTodosByList, filterTodos } from '../utils/todoCalculations';
import { getDragOperation, findTodoById } from '../utils/dragOperations';

export const TaskBoard = () => {
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    createTodo,
    updateTodo,
    deleteTodo,
    moveToList,
    reorderTodo,
  } = useBoard();

  const {
    lists,
    loading: listsLoading,
    error: listsError,
    createList,
    updateList,
    deleteList,
  } = useLists();

  const [searchQuery, setSearchQuery] = useState('');

  const loading = todosLoading || listsLoading;
  const error = todosError || listsError;

  // Group and filter todos (sorting is now handled per-column)
  const groupedTodos = useMemo(() => {
    const filtered = filterTodos(todos, searchQuery);
    return groupTodosByList(filtered, lists);
  }, [todos, lists, searchQuery]);

  const handleDrop = async (
    todoId: string,
    targetListId: string,
    dropIndex?: number
  ) => {
    const draggedTodo = findTodoById(todos, todoId);
    if (!draggedTodo) return;

    const targetListTodos = groupedTodos[targetListId] || [];
    const operation = getDragOperation(
      draggedTodo,
      targetListId,
      targetListTodos,
      dropIndex
    );

    if (operation.type === 'move-list') {
      await moveToList(todoId, operation.targetListId);
    } else if (operation.type === 'reorder') {
      await reorderTodo(todoId, operation.targetPriority);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm(MESSAGES.CONFIRM_DELETE_TASK)) {
      await deleteTodo(id);
    }
  };

  const handleDeleteList = async (id: string) => {
    const listTodos = groupedTodos[id] || [];
    if (listTodos.length > 0) {
      alert(MESSAGES.ERROR_DELETE_LIST_WITH_TASKS);
      return;
    }
    if (window.confirm(MESSAGES.CONFIRM_DELETE_LIST)) {
      await deleteList(id);
    }
  };

  const handleRenameList = async (id: string, newName: string) => {
    await updateList(id, { name: newName });
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>{MESSAGES.PAGE_TITLE}</S.Title>
        <S.Subtitle>{MESSAGES.PAGE_SUBTITLE}</S.Subtitle>
      </S.Header>

      <S.Controls>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </S.Controls>

      {error && <Feedback.ErrorBanner>{error}</Feedback.ErrorBanner>}

      {loading && lists.length === 0 ? (
        <Feedback.Loading>{MESSAGES.STATUS_LOADING}</Feedback.Loading>
      ) : (
        <S.BoardContainer>
          {lists.map((list, index) => (
            <ListColumn
              key={list.id}
              list={list}
              todos={groupedTodos[list.id] || []}
              onAddTodo={
                index === 0
                  ? (listId, title, desc) => createTodo(title, listId, desc)
                  : undefined
              }
              onUpdateTodo={updateTodo}
              onDeleteTodo={handleDeleteTodo}
              onRenameList={handleRenameList}
              onDeleteList={handleDeleteList}
              onDrop={handleDrop}
            />
          ))}

          <CreateListForm onCreateList={createList} />
        </S.BoardContainer>
      )}
    </S.Container>
  );
};
