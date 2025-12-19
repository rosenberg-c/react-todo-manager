import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button, Form } from '@repo-pak/components';

import { MESSAGES } from './messages';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export const UserLogin = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <Form.Form onSubmit={handleSubmit}>
      <Form.FormGroup>
        <Form.Label htmlFor="login-username">
          {MESSAGES.LABEL_USERNAME}
        </Form.Label>
        <Form.Input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={MESSAGES.PLACEHOLDER_USERNAME}
          required
        />
      </Form.FormGroup>

      <Form.FormGroup>
        <Form.Label htmlFor="login-password">
          {MESSAGES.LABEL_PASSWORD}
        </Form.Label>
        <Form.Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={MESSAGES.PLACEHOLDER_PASSWORD}
          required
        />
      </Form.FormGroup>

      <Button.Primary type="submit">{MESSAGES.BUTTON_LOGIN}</Button.Primary>
    </Form.Form>
  );
};
