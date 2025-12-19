import type { JSX } from 'react';
import { useState } from 'react';
import { Form } from '@repo-pak/components';

import * as S from '../Todos.styles';
import { MESSAGES } from '../messages';

interface AddTodoFormProps {
  onAdd: (title: string, description?: string) => Promise<void>;
}

export const AddTodoForm = ({ onAdd }: AddTodoFormProps): JSX.Element => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setIsExpanded(false);
    } catch (error) {
      console.error(MESSAGES.ERROR_ADD_TODO_FAILED, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <S.Button
        type="button"
        $variant="primary"
        onClick={() => setIsExpanded(true)}
        style={{ width: '100%', marginBottom: '12px' }}
      >
        {MESSAGES.BUTTON_ADD_TASK}
      </S.Button>
    );
  }

  return (
    <S.AddForm onSubmit={handleSubmit}>
      <Form.Input
        type="text"
        placeholder={MESSAGES.PLACEHOLDER_TASK_TITLE}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        maxLength={200}
      />
      <Form.TextArea
        placeholder={MESSAGES.PLACEHOLDER_TASK_DESCRIPTION}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
      />
      <S.ButtonGroup>
        <S.Button type="button" onClick={handleCancel} disabled={isSubmitting}>
          {MESSAGES.BUTTON_CANCEL}
        </S.Button>
        <S.Button
          type="submit"
          $variant="primary"
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting
            ? MESSAGES.BUTTON_ADDING
            : MESSAGES.BUTTON_ADD_TASK_SHORT}
        </S.Button>
      </S.ButtonGroup>
    </S.AddForm>
  );
};
