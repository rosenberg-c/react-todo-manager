import { useState } from 'react';
import type { ListContracts } from '@repo-pak/api-client';
import { Form } from '@repo-pak/components';
import type { SortOption } from '../../utils/todoCalculations';
import * as S from '../Todos.styles';

interface ListHeaderProps {
  list: ListContracts.ListResponseDto;
  todoCount: number;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const ListHeader = ({
  list,
  todoCount,
  onRename,
  onDelete,
  sortBy,
  onSortChange,
}: ListHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(list.name);

  const handleRename = async () => {
    if (name.trim() && name !== list.name) {
      try {
        await onRename(list.id, name.trim());
      } catch (error) {
        // Revert on error
        setName(list.name);
      }
    } else {
      setName(list.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setName(list.name);
      setIsEditing(false);
    }
  };

  return (
    <>
      <S.ColumnHeader>
        {isEditing ? (
          <Form.Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={50}
            style={{ flex: 1 }}
          />
        ) : (
          <S.ColumnTitle onClick={() => setIsEditing(true)}>
            {list.name}
          </S.ColumnTitle>
        )}
        <S.ColumnActions>
          <S.ColumnCount>{todoCount}</S.ColumnCount>
          <S.IconButton
            onClick={() => onDelete(list.id)}
            title="Delete list"
            type="button"
          >
            🗑️
          </S.IconButton>
        </S.ColumnActions>
      </S.ColumnHeader>

      <S.SortContainer style={{ marginBottom: '12px', padding: '0 4px' }}>
        <S.SortSelect
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Sort tasks"
        >
          <option value="priority">Priority</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">A-Z</option>
          <option value="title-desc">Z-A</option>
        </S.SortSelect>
      </S.SortContainer>
    </>
  );
};
