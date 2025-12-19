import { ValidationError } from '../utils/errors';

export interface UpdateListDto {
  name?: string;
  priority?: number;
}

export function validateUpdateListDto(dto: any): UpdateListDto {
  const result: UpdateListDto = {};

  if (dto.name !== undefined) {
    if (typeof dto.name !== 'string') {
      throw new ValidationError('Name must be a string');
    }
    if (dto.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }
    if (dto.name.length > 50) {
      throw new ValidationError('Name must be less than 50 characters');
    }
    result.name = dto.name.trim();
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
