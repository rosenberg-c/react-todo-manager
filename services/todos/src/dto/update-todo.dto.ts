import { ValidationError } from '../utils/errors';

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  listId?: string;
  priority?: number;
}

export function validateUpdateTodoDto(dto: any): UpdateTodoDto {
  const result: UpdateTodoDto = {};

  if (dto.title !== undefined) {
    if (typeof dto.title !== 'string') {
      throw new ValidationError('Title must be a string');
    }
    if (dto.title.trim().length === 0) {
      throw new ValidationError('Title cannot be empty');
    }
    if (dto.title.length > 200) {
      throw new ValidationError('Title must be less than 200 characters');
    }
    result.title = dto.title.trim();
  }

  if (dto.description !== undefined) {
    if (typeof dto.description !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    if (dto.description.length > 1000) {
      throw new ValidationError(
        'Description must be less than 1000 characters'
      );
    }
    result.description = dto.description.trim();
  }

  if (dto.listId !== undefined) {
    if (typeof dto.listId !== 'string') {
      throw new ValidationError('List ID must be a string');
    }
    result.listId = dto.listId;
  }

  if (dto.priority !== undefined) {
    if (typeof dto.priority !== 'number') {
      throw new ValidationError('Priority must be a number');
    }
    if (!Number.isInteger(dto.priority)) {
      throw new ValidationError('Priority must be an integer');
    }
    result.priority = dto.priority;
  }

  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided for update');
  }

  return result;
}
