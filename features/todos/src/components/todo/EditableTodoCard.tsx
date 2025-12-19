import { useState } from 'react';
import type { TodoContracts } from '@repo-pak/api-client';
import { Form } from '@repo-pak/components';
import * as S from '../Todos.styles';

interface EditableTodoCardProps {
  todo: TodoContracts.TodoResponseDto;
  onUpdate: (
    id: string,
    updates: { title?: string; description?: string }
  ) => Promise<void>;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, todoId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const EditableTodoCard = ({
  todo,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
}: EditableTodoCardProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');

  const handleTitleSave = async () => {
    if (title.trim() && title !== todo.title) {
      try {
        await onUpdate(todo.id, { title: title.trim() });
      } catch (error) {
        setTitle(todo.title);
      }
    } else {
      setTitle(todo.title);
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = async () => {
    const trimmedDesc = description.trim();
    if (trimmedDesc !== (todo.description || '')) {
      try {
        await onUpdate(todo.id, { description: trimmedDesc });
      } catch (error) {
        setDescription(todo.description || '');
      }
    }
    setIsEditingDescription(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(todo.title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDescription(todo.description || '');
      setIsEditingDescription(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <S.Card
      draggable={!isEditingTitle && !isEditingDescription}
      onDragStart={(e) => onDragStart(e, todo.id)}
      onDragEnd={onDragEnd}
    >
      <S.CardHeader>
        {isEditingTitle ? (
          <Form.Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            maxLength={200}
            style={{ width: '100%' }}
          />
        ) : (
          <S.CardTitle onClick={() => setIsEditingTitle(true)}>
            {todo.title}
          </S.CardTitle>
        )}
      </S.CardHeader>

      {isEditingDescription ? (
        <Form.TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionSave}
          onKeyDown={handleDescriptionKeyDown}
          autoFocus
          maxLength={1000}
          rows={3}
          style={{ width: '100%', marginBottom: '8px' }}
        />
      ) : (
        <S.CardDescription
          onClick={() => setIsEditingDescription(true)}
          style={{ cursor: 'pointer' }}
        >
          {todo.description || 'Click to add description...'}
        </S.CardDescription>
      )}

      <S.CardFooter>
        <S.CardDate>{formatDate(todo.createdAt)}</S.CardDate>
        <S.DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          type="button"
        >
          Delete
        </S.DeleteButton>
      </S.CardFooter>
    </S.Card>
  );
};
