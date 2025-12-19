import { ValidationError } from '../utils/errors';

export interface CreateTodoDto {
  title: string;
  description?: string;
  listId: string;
  userId: string;
}

export function validateCreateTodoDto(dto: any): CreateTodoDto {
  if (!dto.title || typeof dto.title !== 'string') {
    throw new ValidationError('Title is required and must be a string');
  }

  if (dto.title.trim().length === 0) {
    throw new ValidationError('Title cannot be empty');
  }

  if (dto.title.length > 200) {
    throw new ValidationError('Title must be less than 200 characters');
  }

  if (dto.description !== undefined && typeof dto.description !== 'string') {
    throw new ValidationError('Description must be a string');
  }

  if (dto.description && dto.description.length > 1000) {
    throw new ValidationError('Description must be less than 1000 characters');
  }

  if (!dto.listId || typeof dto.listId !== 'string') {
    throw new ValidationError('List ID is required and must be a string');
  }

  if (!dto.userId || typeof dto.userId !== 'string') {
    throw new ValidationError('User ID is required and must be a string');
  }

  return {
    title: dto.title.trim(),
    description: dto.description?.trim(),
    listId: dto.listId,
    userId: dto.userId,
  };
}
