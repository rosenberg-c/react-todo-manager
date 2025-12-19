import { useState } from 'react';
import { Form } from '@repo-pak/components';
import * as S from '../Todos.styles';

interface CreateListFormProps {
  onCreateList: (name: string) => Promise<void>;
}

export const CreateListForm = ({ onCreateList }: CreateListFormProps) => {
  const [name, setName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onCreateList(name.trim());
        setName('');
        setIsExpanded(false);
      } catch (error) {
        // Error handled by context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <S.AddListButton onClick={() => setIsExpanded(true)} type="button">
        + Add List
      </S.AddListButton>
    );
  }

  return (
    <S.AddListForm onSubmit={handleSubmit}>
      <Form.Input
        placeholder="List name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        maxLength={50}
        disabled={isSubmitting}
      />
      <S.ButtonGroup>
        <S.Button type="button" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </S.Button>
        <S.Button type="submit" $variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add'}
        </S.Button>
      </S.ButtonGroup>
    </S.AddListForm>
  );
};
