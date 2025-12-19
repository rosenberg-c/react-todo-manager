import { describe, it, expect } from 'vitest';
import type { TodoContracts } from '@repo-pak/api-client';
import { sortByPriority, filterTodos } from './todoCalculations';

describe('todoCalculations', () => {
  describe('sortByPriority', () => {
    it('should sort todos by priority in descending order (highest first)', () => {
      const todoA: TodoContracts.TodoResponseDto = {
        id: '1',
        title: 'Low priority',
        priority: 100,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const todoB: TodoContracts.TodoResponseDto = {
        id: '2',
        title: 'High priority',
        priority: 500,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const result = sortByPriority(todoA, todoB);

      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for todos with equal priority', () => {
      const todoA: TodoContracts.TodoResponseDto = {
        id: '1',
        title: 'Task A',
        priority: 100,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const todoB: TodoContracts.TodoResponseDto = {
        id: '2',
        title: 'Task B',
        priority: 100,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const result = sortByPriority(todoA, todoB);

      expect(result).toBe(0);
    });

    it('should handle negative priorities', () => {
      const todoA: TodoContracts.TodoResponseDto = {
        id: '1',
        title: 'Negative priority',
        priority: -50,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const todoB: TodoContracts.TodoResponseDto = {
        id: '2',
        title: 'Positive priority',
        priority: 50,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const result = sortByPriority(todoA, todoB);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('filterTodos', () => {
    it('should filter todos by title (case insensitive)', () => {
      const todos: TodoContracts.TodoResponseDto[] = [
        {
          id: '1',
          title: 'Buy groceries',
          listId: 'list-1',
          priority: 100,
          userId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Clean house',
          listId: 'list-1',
          priority: 200,
          userId: 'user1',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
        {
          id: '3',
          title: 'Buy clothes',
          listId: 'list-1',
          priority: 300,
          userId: 'user1',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-03',
        },
      ];

      const result = filterTodos(todos, 'buy');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    it('should NOT filter by description', () => {
      const todos: TodoContracts.TodoResponseDto[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'This contains search term',
          listId: 'list-1',
          priority: 100,
          userId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Contains search term',
          listId: 'list-1',
          priority: 200,
          userId: 'user1',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
      ];

      const result = filterTodos(todos, 'search term');

      // Should only match title, not description
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return all todos when search query is empty', () => {
      const todos: TodoContracts.TodoResponseDto[] = [
        {
          id: '1',
          title: 'Task 1',
          listId: 'list-1',
          priority: 100,
          userId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          listId: 'list-1',
          priority: 200,
          userId: 'user1',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
      ];

      const result = filterTodos(todos, '');

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no todos match', () => {
      const todos: TodoContracts.TodoResponseDto[] = [
        {
          id: '1',
          title: 'Task 1',
          listId: 'list-1',
          priority: 100,
          userId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      const result = filterTodos(todos, 'nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should handle partial matches', () => {
      const todos: TodoContracts.TodoResponseDto[] = [
        {
          id: '1',
          title: 'Implementation',
          listId: 'list-1',
          priority: 100,
          userId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      const result = filterTodos(todos, 'impl');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
