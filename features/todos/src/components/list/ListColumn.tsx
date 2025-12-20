import { useState, useMemo } from 'react';
import type { TodoContracts, ListContracts } from '@repo-pak/api-client';
import { Feedback } from '@repo-pak/components';
import { EditableTodoCard } from '../todo/EditableTodoCard';
import { AddTodoForm } from '../todo/AddTodoForm';
import { ListHeader } from './ListHeader';
import { sortTodos, type SortOption } from '../../utils/todoCalculations';
import * as S from '../Todos.styles';
import { MESSAGES } from '../messages';

interface ListColumnProps {
  list: ListContracts.ListResponseDto;
  todos: TodoContracts.TodoResponseDto[];
  onAddTodo?: (
    listId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  onUpdateTodo: (
    id: string,
    updates: { title?: string; description?: string }
  ) => Promise<void>;
  onDeleteTodo: (id: string) => void;
  onRenameList: (id: string, newName: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  onDrop: (todoId: string, listId: string, dropIndex?: number) => void;
  onDragStart?: (todoId: string) => void;
  onDragEnd?: () => void;
}

export const ListColumn = ({
  list,
  todos,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onRenameList,
  onDeleteList,
  onDrop,
  onDragStart,
  onDragEnd,
}: ListColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  // Sort todos independently for this column
  const sortedTodos = useMemo(() => {
    return sortTodos(todos, sortBy);
  }, [todos, sortBy]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const todoId = e.dataTransfer.getData('todoId');
    if (todoId) {
      onDrop(todoId, list.id, dropTargetIndex ?? undefined);
    }
    setDropTargetIndex(null);
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetIndex(index);
  };

  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    e.dataTransfer.setData('todoId', todoId);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(todoId);
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    onDragEnd?.();
  };

  return (
    <S.Column
      $isDragOver={isDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ListHeader
        list={list}
        todoCount={todos.length}
        onRename={onRenameList}
        onDelete={onDeleteList}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {onAddTodo && (
        <AddTodoForm onAdd={(title, desc) => onAddTodo(list.id, title, desc)} />
      )}

      <S.TodoList>
        {sortedTodos.length === 0 ? (
          <Feedback.EmptyState>
            {onAddTodo ? MESSAGES.EMPTY_ADD_TASK : MESSAGES.EMPTY_NO_TASKS}
          </Feedback.EmptyState>
        ) : (
          sortedTodos.map((todo, index) => (
            <div key={todo.id} onDragOver={(e) => handleCardDragOver(e, index)}>
              <EditableTodoCard
                todo={todo}
                onUpdate={onUpdateTodo}
                onDelete={onDeleteTodo}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            </div>
          ))
        )}
      </S.TodoList>
    </S.Column>
  );
};
