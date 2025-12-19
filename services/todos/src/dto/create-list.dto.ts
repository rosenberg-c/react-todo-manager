import { ValidationError } from '../utils/errors';

export interface CreateListDto {
  name: string;
  userId: string;
}

export function validateCreateListDto(dto: any): CreateListDto {
  if (!dto.name || typeof dto.name !== 'string') {
    throw new ValidationError('Name is required and must be a string');
  }

  if (dto.name.trim().length === 0) {
    throw new ValidationError('Name cannot be empty');
  }

  if (dto.name.length > 50) {
    throw new ValidationError('Name must be less than 50 characters');
  }

  if (!dto.userId || typeof dto.userId !== 'string') {
    throw new ValidationError('User ID is required and must be a string');
  }

  return {
    name: dto.name.trim(),
    userId: dto.userId,
  };
}
