import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button, Form } from '@repo-pak/components';

import type { useUsers } from '../contexts/UsersContext';
import { MESSAGES } from './messages';

export const UserCreate = (props: { ctx: ReturnType<typeof useUsers> }) => {
  const { ctx } = props;
  const { createUser, loading } = ctx;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (username.length < 3) {
      setFormError(MESSAGES.ERROR_USERNAME_TOO_SHORT);
      return;
    }

    if (password.length < 8) {
      setFormError(MESSAGES.ERROR_PASSWORD_TOO_SHORT);
      return;
    }

    try {
      await createUser(username, password);
      setUsername('');
      setPassword('');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : MESSAGES.ERROR_CREATE_USER_FAILED
      );
    }
  };

  return (
    <Form.Form onSubmit={handleSubmit}>
      {formError && <Form.FormError>{formError}</Form.FormError>}

      <Form.FormGroup>
        <Form.Label htmlFor="create-username">
          {MESSAGES.LABEL_USERNAME}
        </Form.Label>
        <Form.Input
          id="create-username"
          type="text"
          placeholder={MESSAGES.PLACEHOLDER_USERNAME_CREATE}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required
        />
      </Form.FormGroup>

      <Form.FormGroup>
        <Form.Label htmlFor="create-password">
          {MESSAGES.LABEL_PASSWORD}
        </Form.Label>
        <Form.Input
          id="create-password"
          type="password"
          placeholder={MESSAGES.PLACEHOLDER_PASSWORD_CREATE}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </Form.FormGroup>

      <Button.Primary type="submit" disabled={loading}>
        {loading ? MESSAGES.BUTTON_CREATING : MESSAGES.BUTTON_CREATE_USER}
      </Button.Primary>
    </Form.Form>
  );
};
