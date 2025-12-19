import { ValidationError } from '../utils/errors';

export interface LoginDto {
  username: string;
  password: string;
}

export function validateLoginDto(data: unknown): LoginDto {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be an object');
  }

  const { username, password } = data as Partial<LoginDto>;

  return {
    username: requireStringField(username, 'Username'),
    password: requireStringField(password, 'Password'),
  };
}

function requireStringField(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${fieldName} is required and must be a string`);
  }
  return value;
}
