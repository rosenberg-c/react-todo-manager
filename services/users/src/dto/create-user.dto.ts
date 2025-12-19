import { ValidationError } from '../utils/errors';

export interface CreateUserDto {
  username: string;
  password: string;
}

export function validateCreateUserDto(dto: any): CreateUserDto {
  if (!dto.username || typeof dto.username !== 'string') {
    throw new ValidationError('Username is required and must be a string');
  }

  if (dto.username.length < 3 || dto.username.length > 50) {
    throw new ValidationError('Username must be between 3 and 50 characters');
  }

  if (!dto.password || typeof dto.password !== 'string') {
    throw new ValidationError('Password is required');
  }

  if (dto.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  return {
    username: dto.username.trim(),
    password: dto.password,
  };
}
